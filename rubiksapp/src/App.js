import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import moves from './Moves';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function elementWidth(id) {
    return document.getElementById(id).clientWidth;
}

function elementHeight(id) {
    return document.getElementById(id).clientHeight;
}

function debounce(fn, ms) {
    let timer
    return _ => {
        clearTimeout(timer)
        timer = setTimeout(_ => {
            timer = null
            fn.apply(this, arguments)
        }, ms)
    };
}

function Cube({ size, active, rotation, orient, depth, index, n }) {
    const x = index % n, y = Math.floor(index / n) % n, z = Math.floor(index / (n * n));
    const colors = ['#FFFF00', '#ff0054', '#00FFFF', 'white', '#ff7400', '#33FF00'];

    var transformStr = `rotateY(-90deg) translateX(${n % 2 === 0 ? 50 * (2 * z - n / 2) : 50 * (2 * z - n / 2) - 25}%) rotateY(90deg) translateY(${-(2 * z - n + 1) * (n / 2) * 100}%)`;
    transformStr += ` translate3d(${(n - 1 - 2 * x) * (size / 2)}px, ${(n - 1 - 2 * y) * (size / 2)}px, ${(n - 1 - 2 * z) * (size / 2)}px)`;
    if (rotation !== undefined) {
        if (active)
            transformStr += ` rotate3d(${rotation(x, y, z, -1)})`;
    }
    transformStr += ` translate3d(${(2 * x - n + 1) * (size / 2)}px, ${(2 * y - n + 1) * (size / 2)}px, ${(2 * z - n + 1) * (size / 2)}px)`;

    var cubeStyle = {
        width: size + 'px',
        height: size + 'px',
        transform: transformStr,
        zIndex: `${depth}`,
        transition: `${active
            ? 'transform 0.125s cubic-bezier(.45,.05,.55,.95) 0s, z-index 0.125s cubic-bezier(.45,.05,.55,.95) 0s'
            : 'transform 0s, z-index 0s'}`
    };

    const cubeFaceStyle = (color) => {
        return {
            margin: `${size / 10 - 1}px`,
            height: `${8 * size / 10}px`,
            width: `${8 * size / 10}px`,
            border: `${size / 20}px solid ${color}`,
            boxShadow: `inset 0 0 0.5em 0 ${color}, 0 0 1em 0 ${color}`
        };
    }
    return (
        <div className="cube" style={cubeStyle}>
            <div className="front"
                style={{ visibility: `${z === n - 1 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[2]])} />
            </div>
            <div className="back"
                style={{ visibility: `${z === 0 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[5]])} />
            </div>
            <div className="top"
                style={{ visibility: `${y === 0 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[0]])} />
            </div>
            <div className="bottom"
                style={{ visibility: `${y === n - 1 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[3]])} />
            </div>
            <div className="left"
                style={{ visibility: `${x === 0 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[4]])} />
            </div>
            <div className="right"
                style={{ visibility: `${x === n - 1 ? 'visible' : 'hidden'}` }}>
                <div style={cubeFaceStyle(colors[orient[1]])} />
            </div>
        </div>
    );
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function RubiksCube({ size, parentDim }) {
    const n = 3;
    var init_color = [];
    var init_depth = [];
    for (var z = 0; z < n; z++) {
        for (var y = 0; y < n; y++) {
            for (var x = 0; x < n; x++) {
                init_color.push([0, 1, 2, 3, 4, 5]);
                init_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
            }
        }
    }
    const moveTypes = ['U', 'D', 'X', 'E', 'F', 'B', 'Z', 'S', 'R', 'L', 'M', 'Y'];
    const [moveOngoing, setMoveOngoing] = useState(false);
    const [lastMove, setLastMove] = useState('0');
    const [moveAlter, setMoveAlter] = useState('');
    const [faceColor, setFaceColor] = useState(init_color);
    const [faceDepth, setFaceDepth] = useState(init_depth);

    const handleKeyDown = (key) => {
        return async (event) => {
            if (key in moves(n) && !moveOngoing) {
                console.log(event, key);
                setMoveOngoing(true);
                setLastMove(key + moveAlter);
                setFaceDepth(moves(n)[key + moveAlter][2]);

                await sleep(125);

                setMoveOngoing(false);
                setFaceColor(moves(n)[key + moveAlter][1](faceColor));
                setFaceDepth(moves(n)['0'][2]);
            }
            else if (key === "'") {
                if (moveAlter === "'")
                    setMoveAlter('');
                else
                    setMoveAlter("'");
            }
        }
    }

    var grid = [];
    for (var i = 0; i < n * n * n; i++) {
        grid.push(
            <Cube size={size / n}
                active={moveOngoing}
                rotation={moves(n)[lastMove][0]}
                orient={faceColor[i]}
                depth={faceDepth[i]}
                index={i} n={n} key={"Square" + i}
            />
        );
    }

    var buttons = []
    moveTypes.forEach(mv => buttons.push(
        <button
            className='mybutton'
            onClick={handleKeyDown(mv)}
            key={mv + '-button'}
        >
            {mv + moveAlter}
        </button>
    ));
    buttons.push(
        <button
            className='mybutton'
            onClick={handleKeyDown("'")}
            key={'dash-button'}
            style={{ backgroundColor: moveAlter==="'" ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)'}}
        >
            {"'"}
        </button>
    );
    const buttonsInACol = Math.floor(0.6 * Math.min(parentDim.height, parentDim.width) / 55);
    const buttonsInARow = Math.floor(14 / buttonsInACol) + 1;
    return (
        <div style={{
            overflow: 'visible',
            flex: '1 1 90%',
            display: 'flex',
            flexDirection: size * 2 === parentDim.height ? 'row' : 'column',
            margin: 'auto auto'
        }}>
            <div style={{
                minWidth: `${size * 1.8}px`,
                minHeight: `${size * 1.8}px`,
                maxWidth: `${size * 1.8}px`,
                maxHeight: `${size * 1.8}px`,
                position: 'relative',
                top: '0',
                left: '0',
                margin: size * 2 === parentDim.height ? 'auto 0' : '0 auto',
                overflow: 'hidden'
            }}>
                <div className='cube-container' style={{
                    gridTemplateColumns: `repeat(${n}, 1fr)`,
                    transform: `translateX(-50%) translateY(${-50 * ((n - 2) / 2)}%)`,
                    padding: '0',
                    top: '6%'
                }}>
                    {grid}
                </div>
            </div>
            <div className='buttons-container' style={{
                minWidth: size * 2 === parentDim.height ? '0' : `${size * 1.8}px`,
                minHeight: size * 2 === parentDim.height ? `${size * 1.8}px` : '0',
                padding: size * 2 === parentDim.height ? `20% 0` : `0 20%`,
                margin: size * 2 === parentDim.height ? 'auto 0' : '0 auto',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: size * 2 === parentDim.height ? `repeat(${buttonsInARow}, 1fr)` : `repeat(${buttonsInACol}, 1fr)`,
                gridTemplateRows: size * 2 === parentDim.height ? `repeat(${buttonsInACol}, 1fr)` : `repeat(${buttonsInARow}, 1fr)`,
                gap: '5px'
            }}>
                {buttons}
            </div>
        </div>
    );
}

function MyNavBar(props) {
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="#home">Welcome.</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link href="#TGN">This goes nowhere</Nav.Link>
                    <Nav.Link href="#SFT">Same for this</Nav.Link>
                    <Nav.Link href="#WDYT">What do you think?</Nav.Link>
                    <Nav.Link href="#CO">Come on!</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

function App(props) {
    const [parentDimensions, setDimensions] = React.useState({
        height: elementHeight('root'),
        width: elementWidth('root')
    });

    React.useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
            setDimensions({
                width: elementWidth('root'),
                height: elementHeight('root')
            })
        }, 300);
        window.addEventListener('resize', debouncedHandleResize);
        return _ => {
            window.removeEventListener('resize', debouncedHandleResize);
        };
    });
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: parentDimensions.height,
            width: parentDimensions.width,
            overflow: 'hidden'
        }}>
            <MyNavBar />
            <RubiksCube size={Math.min(parentDimensions.height, parentDimensions.width) / 2} parentDim={parentDimensions} />
        </div>
    );
}

export default App;
