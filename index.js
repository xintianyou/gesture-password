/**
 * 难点：
 * 1、判断手指滑动到了圈圈内
 * 2、有9个圈，每次滑动都去循环遍历判断进入了哪个圈，可能会影响性能
 * 3、一边滑动一遍绘制canvas，影响性能
 */

class GesturePassword {
	constructor(canvas, { size = 300, padding = 0.08 } = {}) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.size = size; // 画布的宽高，因为是正方形，所以只需要一个变量
		this.padding = size * padding; // 画布的padding
		this.circleWidth = 0; // 圆的直径
		this.points = []; // 9个圆心的坐标
		this.hitPoints = []; // 手指滑动到了的圆圈的坐标
		this.init();
	}

	init() {
		const { ctx, canvas, size } = this;
		canvas.width = size;
		canvas.height = size;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, size, size);
		// 计算九个圆圈的圆心的坐标
		const { points, circleWidth } = this.calcCirclePos();
		console.log("[ points ] >", points);
		console.log("[ circleWidth ] >", circleWidth);
		this.circleWidth = circleWidth;
		this.points = points;
		// 画圆
		this.drawCircle();
		// 监听手势
		this.watchGesture();
	}
	// 计算9个小圆圈的中心坐标和小圆圈的大小
	calcCirclePos() {
		const { size, padding } = this;
		const contentSize = size - padding * 2; // 去除画布padding之外的内容宽高

		const circleWidth = contentSize * 0.24; // 每个圆圈的直径

		const distance = (contentSize - circleWidth) / 2; // 每两个圆圈的圆心之间的距离，横竖都一样

		const firstPoint = Math.ff(circleWidth / 2); // 左上角第一个圆的圆心坐标

		const xy = [
			firstPoint,
			Math.ff(firstPoint + distance),
			Math.ff(firstPoint + distance * 2)
		];

		const points = [];
		let i = 0;
		while (i < 3) {
			for (let index = 0; index < xy.length; index++) {
				const element = xy[index];
				points.push({ x: element, y: xy[i] });
			}
			i++;
		}

		return {
			points: points.map((item) => {
				return {
					x: Math.ff(item.x + padding),
					y: Math.ff(item.y + padding)
				};
			}),
			circleWidth
		};
	}
	// 画9个小圆圈
	drawCircle() {
		const { ctx } = this;
		this.points.forEach((item, index) => {
			ctx.beginPath();
			ctx.arc(item.x, item.y, this.circleWidth / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.strokeStyle = "#217bfb"; // 将线条颜色设置为蓝色
			ctx.stroke(); // stroke() 方法默认颜色是黑色（如果没有上面一行，则会是黑色）
		});
	}

	// 监听手势
	watchGesture() {
		const { canvas } = this;
		const isMobile = /Mobile|Android/i.test(navigator.userAgent);

		if (!isMobile) {
			canvas.addEventListener(
				"mousedown",
				({ offsetX: x, offsetY: y }) => {
					this.isDown = true;
					const point = this.trigger(x, y);
					console.log("[ this.trigger(x, y) ] >", point);
					if (point) {
						this.hitPoints.push(point);
					}
					this.drawHitCircle();
				},
				false
			);

			canvas.addEventListener(
				"mousemove",
				this.debounce(({ offsetX: x, offsetY: y }) => {
					if (!this.isDown) return;
					const point = this.trigger(x, y);
					console.log("[ this.trigger(x, y) ] >", point);
					if (point && !this.hitPoints.includes(point)) {
						this.hitPoints.push(point);
					}
					this.drawHitCircle();
				}, 0),
				false
			);

			canvas.addEventListener("mouseup", () => {
				this.isDown = false;
				this.hitPoints = [];
				this.drawHitCircle();
			});
		} else {
			canvas.addEventListener(
				"touchstart",
				(e) => {
					if (e.touches.length !== 1) return;
					const { x, y } = this.getTouchPosition(canvas, e.touches[0]);
					this.isDown = true;
					const point = this.trigger(x, y);
					console.log("[ this.trigger(x, y) ] >", point);
					if (point) {
						this.hitPoints.push(point);
					}
					this.drawHitCircle();
				},
				false
			);

			canvas.addEventListener(
				"touchmove",
				(e) => {
					e.preventDefault();
					if (e.touches.length !== 1) return;
					const { x, y } = this.getTouchPosition(canvas, e.touches[0]);
					this.isDown = true;
					const point = this.trigger(x, y);
					console.log("[ this.trigger(x, y) ] >", point);
					if (point && !this.hitPoints.includes(point)) {
						this.hitPoints.push(point);
					}
					this.drawHitCircle();
				},
				{ passive: false }
			);

			canvas.addEventListener("touchend", () => {
				this.isDown = false;
				this.hitPoints = [];
				this.drawHitCircle();
			});
		}
	}

	// 绘制命中后的圆圈样式
	drawHitCircle() {
		const { ctx } = this;

		console.log("[ this.hitPoints ] >", this.hitPoints);
		if (this.hitPoints.length === 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			this.drawCircle();
			return;
		}

		this.hitPoints.forEach((item, index) => {
			ctx.beginPath();
			ctx.arc(item.x, item.y, this.circleWidth / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.strokeStyle = "#217bfb"; // 将线条颜色设置为蓝色
			ctx.stroke(); // stroke() 方法默认颜色是黑色（如果没有上面一行，则会是黑色）

			ctx.beginPath();
			ctx.arc(item.x, item.y, this.circleWidth / 2 / 3, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fillStyle = "#217bfb"; // 将线条颜色设置为蓝色
			ctx.fill();

			if (index) {
				ctx.beginPath();
				ctx.moveTo(this.hitPoints[index - 1].x, this.hitPoints[index - 1].y);
				ctx.lineTo(item.x, item.y);
				ctx.strokeStyle = "#217bfb";
				ctx.stroke();
			}
		});
	}

	// 判断手指进入了某个圆圈内，返回圈圈坐标
	trigger(x, y) {
		const index = this.points
			.map((item) => {
				const distance = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
				return distance < this.circleWidth / 2;
			})
			.findIndex((item) => item);
		return this.points[index];
	}

	// 移动端获取触摸位置
	getTouchPosition(canvas, event) {
		const rect = canvas.getBoundingClientRect();

		const x = event.pageX - rect.left;
		const y = event.pageY - rect.top;

		return { x, y };
	}

	debounce(func, wait) {
		let timeout;
		return function () {
			const context = this;
			const args = arguments;
			if (timeout) clearTimeout(timeout);

			timeout = setTimeout(() => {
				func.apply(context, args);
			}, wait);
		};
	}
}

// 浮点数计算，f代表需要计算的表达式，digit代表小数位数
Math.ff = function (f, digit = 2) {
	// Math.pow(指数，幂指数)
	const m = Math.pow(10, digit);
	// Math.round() 四舍五入
	return Math.round(f * m, 10) / m;
};
