import React from 'react';

const COLORS = ['#FB9F9F', '#41FF43', '#A4FB9F', '#9FFBE4', '#9FCFFB', '#FFFF41', '#F19FFB', '#FB9FB9', '#A8FFB4'];
const TOTAL = COLORS.length;
const RADIUS = 500;

/* Point */
class Point {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

/* Circle */
class Circle {
  constructor(x, y, radius, color) {
    this.pos = new Point();
    this.target = new Point();
    this.radius = radius;
    this.color = color;
    this.r = parseInt(color.slice(1, 3), 16);
    this.g = parseInt(color.slice(3, 5), 16);
    this.b = parseInt(color.slice(5, 7), 16);
  }

  resize(stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    console.log('stageSize : ', stageWidth, ', ', stageHeight);

    this.pos.x = Math.random() * stageWidth;
    this.pos.y = Math.random() * stageHeight;

    this.target = this.pos.clone();
  }

  animate(ctx) {
    ctx.save();

    const diff_x = this.target.x - this.pos.x;
    const diff_y = this.target.y - this.pos.y;

    const direction_x = diff_x > 0 ? 1 : -1;
    const direction_y = diff_y > 0 ? 1 : -1;

    if (Math.abs(diff_x) < 25 && Math.abs(diff_y) < 25) {
      this.target.x = Math.random() * this.stageWidth;
    } else {
      this.pos.x += direction_x * 0.3 * 3;
      this.pos.y += direction_y * 0.3 * 3;
    }

    ctx.beginPath();
    const g = ctx.createRadialGradient(
      this.pos.x,
      this.pos.y,
      this.radius * 0.03,
      this.pos.x,
      this.pos.y,
      this.radius * 1,
    );
    g.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, 1)`);
    g.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);
    ctx.fillStyle = g;

    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

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

    this.circles = [];
    this.total = TOTAL;
    for (let i = 0; i < this.total; ++i) {
      this.circles[i] = new Circle(0, 0, RADIUS, COLORS[i]);
    }

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

    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    for (let i = 0; i < this.total; ++i) {
      this.circles[i].resize(this.stageWidth, this.stageHeight);
    }
    //https://developer.mozilla.org/ko/docs/Web/HTML/Canvas/Tutorial/Compositing
    this.ctx.globalCompositionOperation = 'saturation';
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

    for (let i = 0; i < this.total; ++i) {
      this.circles[i].animate(this.ctx);
    }
  }

  render() {
    const canvasStyle = {
      width: '100%',
      height: '100vh',
      backgroundColor: '#443781',
    };
    return <canvas ref={this.canvasRef} style={canvasStyle} {...this.props}></canvas>;
  }
}
