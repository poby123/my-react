import React from 'react';

const PI2 = Math.PI * 2;

const COLORS = [
  '#4b45ab',
  '#554fb8',
  '#605ac7',
  '#2a91a8',
  '#2e9ab2',
  '#81b144',
  '#85b944',
  '#8fc549',
  '#e0af27',
  '#eeba2a',
  '#fec72a',
  '#bf342d',
  '#ca3931',
  '#d7423a',
];

class Polygon {
  constructor(x, y, radius, sides) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.sides = sides;
    this.rotate = 0;
  }

  animate(ctx, moveX) {
    ctx.save();

    const angle = PI2 / this.sides; // (360도 / 모서리 개수)
    const angle2 = PI2 / 4; // 360 / 4 = 90도

    ctx.translate(this.x, this.y);

    this.rotate += moveX * 0.008;
    ctx.rotate(this.rotate);

    for (let i = 0; i < this.sides; i++) {
      const x = this.radius * Math.cos(angle * i); // x = r * cos(theta)
      const y = this.radius * Math.sin(angle * i); // y = r * sin(theta)

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);

      //꼭짓점에 사각형 그리기
      ctx.save();
      ctx.fillStyle = COLORS[i];
      ctx.translate(x, y);
      ctx.rotate((((360 / this.sides) * i + 45) * Math.PI) / 180); // n도 * PI / 180 = m 라디안
      ctx.beginPath();
      for (let j = 0; j < 4; j++) {
        const x2 = 100 * Math.cos(angle2 * j);
        const y2 = 100 * Math.sin(angle2 * j);
        j === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
      }
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }

    ctx.restore();
  }
}

/* Canvas */
export default class Canvas extends React.PureComponent {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  /* After "render function" is called, componenetDidMount is called.*/
  componentDidMount() {
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext('2d');

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();

    this.isDown = false;
    this.moveX = 0;
    this.offsetX = 0;

    document.addEventListener('pointerdown', this.onDown.bind(this), false);
    document.addEventListener('pointermove', this.onMove.bind(this), false);
    document.addEventListener('pointerup', this.onUp.bind(this), false);

    window.requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.stageWidth = this.canvas.clientWidth;
    this.stageHeight = this.canvas.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    console.log(this.stageHeight / 1.5);

    this.polygon = new Polygon(
      this.stageWidth / 2,
      this.stageHeight + this.stageHeight / 4,
      // this.stageHeight,
      this.stageHeight / 1.5,
      15,
    );
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

    this.moveX *= 0.92;
    this.polygon.animate(this.ctx, this.moveX);
  }

  onDown(e) {
    this.isDown = true;
    this.moveX = 0;
    this.offsetX = e.clientX;
  }

  onMove(e) {
    if (this.isDown) {
      this.moveX = e.clientX - this.offsetX;
      this.offsetX = e.clientX;
    }
  }

  onUp() {
    this.isDown = false;
  }

  render() {
    const canvasStyle = {
      width: '100%',
      height: '100vh',
      backgroundColor: '#c5beaf',
    };
    return <canvas ref={this.canvasRef} style={canvasStyle} {...this.props}></canvas>;
  }
}
