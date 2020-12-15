import React, { PureComponent } from "react";
import { Link } from "react-router-dom";

export default class Header extends PureComponent {
	render() {
		const containerStyle = {
			position: "fixed",
			border: "1px solid blue",
			left: "0",
			display: "flex",
		};

		const ulStyle = {
			display: "flex",
			border: "1px solid green",
			textAlign: "center",
		};

		const liStyle = {
			listStyle: "none",
			margin: "0 1em",
		};

		const linkStyle = {
			textDecoration: "none",
		};

		return (
			<div style={containerStyle}>
				<ul style={ulStyle}>
					<li style={liStyle}>
						<Link to="/drag-rectangle" style={linkStyle}>
							Drag rectangle
						</Link>
					</li>
					|
					<li style={liStyle}>
						<Link to="/rotate-polygon" style={linkStyle}>
							Rotate Polygon
						</Link>
					</li>
				</ul>
			</div>
		);
	}
}
