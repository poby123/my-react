import React from "react";

const FOLLOW_SPEED = 0.08;
const ROTATE_SPEED = 0.12;
const MAX_ANGLE = 30;
const FPS = 1000 / 60;
const WIDTH = 260;
const HEIGHT = 260;

/* Point */
class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	add(point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	}

	subtract(point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	}

	reduce(value) {
		this.x *= value;
		this.y *= value;
		return this;
	}

	collide(point, width, height) {
		if (this.x >= point.x && this.x <= point.x + width && this.y >= point.y && this.y <= point.y + height) {
			return true;
		} else {
			return false;
		}
	}

	clone() {
		return new Point(this.x, this.y);
	}
}

/* Dialog */
class Dialog {
	constructor() {
		this.pos = new Point();
		this.target = new Point();
		this.prevPos = new Point();
		this.downPos = new Point();
		this.startPos = new Point();
		this.mousePos = new Point();
		this.centerPos = new Point();
		this.origin = new Point();
		this.rotation = 0;
		this.sideValue = 0;
		this.isDown = false;
	}

	resize(stageWidth, stageHeight) {
		this.pos.x = Math.random() * (stageWidth - WIDTH);
		this.pos.y = Math.random() * (stageHeight - HEIGHT);
		this.target = this.pos.clone();
		this.prevPos = this.pos.clone();
	}

	animate(ctx) {
		const move = this.target.clone().subtract(this.pos).reduce(FOLLOW_SPEED); //움직일 량 = (목표 위치-현재위치)*속도
		this.pos.add(move); //현재 위치에 더한다.

		this.centerPos = this.pos.clone().add(this.mousePos); //이동한 사각형 위치 + (상대적 위치)

		this.swingDrag(ctx);
		this.prevPos = this.pos.clone();
	}

	swingDrag(ctx){
		const dx = this.pos.x - this.prevPos.x; //x값 변화량
		const speedX = Math.abs(dx) / FPS; //변화량 / Frame Per Seconds
		const speed = Math.min(speedX, 1);

		let rotation = MAX_ANGLE * speed;
		rotation = rotation * (dx > 0 ? 1 : -1) - this.sideValue;

		this.rotation += (rotation - this.rotation) * ROTATE_SPEED; //회전속도 = 처음 회전속도 + (나중회전속도 - 처음회전속도) * 속도

		const tmpPos = this.pos.clone().add(this.origin); // animate에서 이동한 현재 사각형 위치 + 사각형 위치를 기준으로 한 마우스의 상대적 위치
		ctx.save(); //이때까지의 상태를 저장.
		ctx.translate(tmpPos.x, tmpPos.y); // translate(x, y) : 지정한 x, y 거리 만큼 이동한다.
		ctx.rotate(this.rotation * Math.PI / 180); //radian
		ctx.beginPath();
		ctx.fillStyle = `#f4e55a`;
		ctx.fillRect(-this.origin.x, -this.origin.y, WIDTH, HEIGHT);
		ctx.restore(); //저장했던 context를 복구.
	}

	down(point) {
		if (point.collide(this.pos, WIDTH, HEIGHT)) {
			this.isDown = true;  //set flag as true
			this.startPos = this.pos.clone();  //클릭되었을 때의 사각형의 위치.
			this.downPos = point.clone();  //클릭되었을 때의 마우스 포인터의 위치.
			this.mousePos = point.clone().subtract(this.pos); //클릭 시점에서의 마우스 포인터 위치 - 클릭한 시점에서 사각형의 위치 = 사각형의 위치를 기준으로 한 마우스의 상대적 위치.

			const xRatioValue = this.mousePos.x / WIDTH;
			this.origin.x = this.mousePos.x;//WIDTH * xRatioValue;
			this.origin.y = this.mousePos.y; //HEIGHT * this.mousePos.y / HEIGHT;

			this.sideValue = xRatioValue - 0.5;

			return this;
		} else {
			return null;
		}
	}

	move(point) {
		if (this.isDown) {
			//목표 위치 = 클릭한 시점에서의 사각형 시작 위치 + (이동한 마우스 위치 - 처음 클릭한 시점에서의 마우스 위치)
			//목표 위치 = 클릭한 시점에서의 사각형 시작 위치 + 마우스의 이동량
			this.target = this.startPos.clone().add(point).subtract(this.downPos);
		}
	}

	up() {
		this.isDown = false;
	}
}

/* Canvas */
export default class Canvas extends React.PureComponent{
	
	constructor(props){
		super(props);

		/* createRef() 를 통해 Ref를 생성하고, canvas의 ref attribute를 통해 React 엘리먼트에 부착된다. */
		this.canvasRef = React.createRef();
	}

	/* After "render function" is called, componenetDidMount is called.*/
	componentDidMount(){
		this.canvas = this.canvasRef.current;
		this.ctx = this.canvas.getContext("2d"); 

		/* 
			window.devicePixelRatio는 해당 기기의 ppi / 150 을 의미한다.
			canvas는 ppi가 낮은 디스플레이에서 흐릿하게 보일 수 있으므로, 얼마나 많은 밀도의 픽셀을 추가할지 결정해준다.
		*/
		// console.log(window.devicePixelRatio);
		this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
 
		this.mousePos = new Point();
		this.curItem = null;

		this.items = [];
		this.total = 1;
		for (let i = 0; i < this.total; i++) {
			this.items[i] = new Dialog();
		}

		/*
			window의 resize event는 document view의 크기가 변경될 때 발생된다.
			resize 이벤트는 빈번하게 발생될 수 있으므로, 이벤트 핸들러는 
			DOM 수정과 같이 계산이 많이 필요한 연산은 실행하면 안된다.
			따라서 대신에 requestAnimationFrame, setTimeout 등을 통해 이벤트를 throttle 하는 것이 좋다.
		*/
		window.addEventListener("resize", this.resize.bind(this), false);
		this.resize();

		/*
			window.requestAnimcationFrame()은 브라우저에게 수행하기를 원하는 애니메이션을 알리고,
			다음 리페인트가 진행되기 전에 해당 애니메이션을 업데이트하는 함수를 호출시킨다.
			이 메서드는 리페인트 이전에 실행할 콜백함수를 인자로 받는다.
		*/
		window.requestAnimationFrame(this.animate.bind(this));

		/* pointerdown, pointermove, pointerup 이벤트 등록 */
		document.addEventListener("pointerdown", this.onDown.bind(this), false);
		document.addEventListener("pointermove", this.onMove.bind(this), false);
		document.addEventListener("pointerup", this.onUp.bind(this), false);
	}

	resize() {
		/* 
			Element.clientWidth 와 clientHeigth는 element의 너비와 높이를 알려준다.
			clientHeight = [CSS] height + [CSS] padding - height of horizonal scrollbar (if present).
			라고 생각하면 된다.
		*/
		this.stageWidth = this.canvas.clientWidth;
		this.stageHeight = this.canvas.clientHeight;

		this.canvas.width = this.stageWidth * this.pixelRatio;
		this.canvas.height = this.stageHeight * this.pixelRatio;

		this.ctx.scale(this.pixelRatio, this.pixelRatio);

		/* 그림자 설정 */
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 10;
		this.ctx.shadowBlur = 6;
		this.ctx.shadowColor = `rgba(0, 0, 0, 0.5)`;

		this.ctx.lineWidth = 2;

		for (let i = 0; i < this.items.length; i++) {
			this.items[i].resize(this.stageWidth, this.stageHeight);
		}
	}

	animate() {
		window.requestAnimationFrame(this.animate.bind(this));
		this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); //clear canvas

		for (let i = 0; i < this.items.length; i++) {
			this.items[i].animate(this.ctx);
		}

		if(this.curItem){
			this.ctx.fillStyle = `#ff4338`;
			this.ctx.strokeStyle = `#ff4338`;
			
			/* draw point where current mouse position */
			this.ctx.beginPath();
			this.ctx.arc(this.mousePos.x, this.mousePos.y,8,0,Math.PI * 2);
			this.ctx.fill();

			/* draw point where clicked in rectangle */
			this.ctx.beginPath();
			this.ctx.arc(this.curItem.centerPos.x, this.curItem.centerPos.y,8,0,Math.PI * 2);
			this.ctx.fill();

			/* draw line between upper to points */
			this.ctx.beginPath();
			this.ctx.moveTo(this.mousePos.x, this.mousePos.y);
			this.ctx.lineTo(this.curItem.centerPos.x, this.curItem.centerPos.y);

			/* strokes the current or given path with current stroke style */
			this.ctx.stroke();
		}
	}

	onDown(e) {
		/* get mouse position */
		this.mousePos.x = e.clientX;
		this.mousePos.y = e.clientY;

		for(let i=this.items.length-1;i>=0;i--){
			const item = this.items[i].down(this.mousePos.clone());

			/* if collide items[i].down function return Dialog instance, if not, it return null and item could be null */
			if(item){
				this.curItem = item; //set this.curItem as selected Dialog instance
				// const index = this.items.indexOf(item); // it finds item in the items and return first found index.
				// this.items.push(this.items.splice(index,1)[0]); //splice(start, deleteCount, addItem...), and splice return deleted array.
				break;
			}
		}
	}

	onMove(e) {
		this.mousePos.x = e.clientX;
		this.mousePos.y = e.clientY;

		for(let i=0;i<this.items.length;++i){
			this.items[i].move(this.mousePos.clone());
		}

	}

	onUp() {
		this.curItem = null;
		for(let i=0;i<this.items.length;++i){
			this.items[i].up();
		}
	}
	
	render(){
		const canvasStyle = {
			width:"100%",
			height:"100vh",
			// border:"1px solid red",
			backgroundColor:"cyan"
		}
		return <canvas ref={this.canvasRef} style={canvasStyle} {...this.props}></canvas>
	}
}

/* Body Class */
// export default class DragRectangle extends React.PureComponent {
// 	render() {
// 		return (
// 			<Canvas/>
// 		);
// 	}
// }
