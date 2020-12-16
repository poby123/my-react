import React from 'react';

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

    window.requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.stageWidth = this.canvas.clientWidth;
    this.stageHeight = this.canvas.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;

    this.centerX = this.stageWidth / 2;
    this.centerY = this.stageHeight / 2;

    this.sides = 5;
    this.radius = 200;
    this.rotate = 0;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate);

    for (let i = 0; i < this.sides; ++i) {
      const x = this.radius * Math.cos(((2 * Math.PI) / this.sides) * i);
      const y = this.radius * Math.sin(((2 * Math.PI) / this.sides) * i);

      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    }
    // this.ctx.arc(this.centerX, this.centerY, 100, 0, 2 * Math.PI, false);
    //this.ctx.fill(); //채우기
    this.ctx.lineWidth = 5; //굵기 지정.
    this.ctx.strokeStyle = `red`;
    this.ctx.closePath(); //선을 그리기 전에 close 해주면 마지막 점과 처음그린 점을 이어준다.
    this.ctx.stroke(); //선 그리기.

    this.ctx.restore();
    this.rotate += 0.002;
  }

  render() {
    const canvasStyle = {
      width: '100%',
      height: '100vh',
      border: '1px solid blue',
    };
    return <canvas ref={this.canvasRef} style={canvasStyle} {...this.props}></canvas>;
  }
}
