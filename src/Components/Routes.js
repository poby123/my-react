import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import DragRectangle from '../Screens/DragRectangle';
import CanvasPractice from '../Screens/CanvasPractice';
import RotatePolygon from '../Screens/RotatePolygon';
import MovingCircles from '../Screens/MovingCircles';
import Header from './Header';

class Routes extends Component {
  render() {
    return (
      <Router>
        <Header />
        <Route path="/drag-rectangle" component={DragRectangle} />
        <Route path="/rotate-polygon" component={RotatePolygon} />
        <Route path="/moving-circles" component={MovingCircles} />
        <Route path="/canvas-practice" component={CanvasPractice} />
      </Router>
    );
  }
}

Routes.propTypes = {};

export default Routes;
