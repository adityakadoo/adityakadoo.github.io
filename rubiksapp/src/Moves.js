const moves = (n) => {
    return {
        '0': [(x, y, z) => {
            return `0,0,1,${0}deg`;
        }, () => {
            var init_state = []
            for (var a = 0; a < n * n * n; a++) {
                init_state.push([0, 1, 2, 3, 4, 5]);
            }
            return init_state;
        }, () => {
            var init_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        init_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return init_depth;
        }],
        'U': [(x, y, z, d) => {
            if (y === 0)
                return `0,1,0,${d * 90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - x) * n * n + y * n + z;
                        if (y === 0)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === 0)
                            new_depth.push(x * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "U'": [(x, y, z, d) => {
            if (y === 0)
                return `0,1,0,${d * -90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = x * n * n + y * n + (n - 1 - z);
                        if (y === 0)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][1]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === 0)
                            new_depth.push((n - 1 - x) * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'D': [(x, y, z, d) => {
            if (y === 2)
                return `0,1,0,${d * -90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = x * n * n + y * n + (n - 1 - z);
                        if (y === 2)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][1]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === n - 1)
                            new_depth.push((n - 1 - x) * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "D'": [(x, y, z, d) => {
            if (y === 2)
                return `0,1,0,${d * 90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - x) * n * n + y * n + z;
                        if (y === 2)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === n - 1)
                            new_depth.push(x * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "R'": [(x, y, z, d) => {
            if (x === 2)
                return `1,0,0,${d * 90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = y * n * n + (n - 1 - z) * n + x;
                        if (x === 2)
                            new_state.push(
                                [orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === n - 1)
                            new_depth.push((n - 1 - y) * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'R': [(x, y, z, d) => {
            if (x === 2)
                return `1,0,0,${d * -90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - y) * n * n + z * n + x;
                        if (x === 2)
                            new_state.push(
                                [orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][4],
                                orientation[t1][0]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === n - 1)
                            new_depth.push(y * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'L': [(x, y, z, d) => {
            if (x === 0)
                return `1,0,0,${d * 90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - y) * n * n + z * n + x;
                        if (x === 0)
                            new_state.push(
                                [orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === 0)
                            new_depth.push((n - 1 - y) * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "L'": [(x, y, z, d) => {
            if (x === 0)
                return `1,0,0,${d * -90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = y * n * n + (n - 1 - z) * n + x;
                        if (x === 0)
                            new_state.push(
                                [orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][4],
                                orientation[t1][0]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === 0)
                            new_depth.push(y * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'B': [(x, y, z, d) => {
            if (z === 0)
                return `0,0,1,${d * 90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + (n - 1 - x) * n + y;
                        if (z === 0)
                            new_state.push(
                                [orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "B'": [(x, y, z, d) => {
            if (z === 0)
                return `0,0,1,${d * -90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + x * n + (n - 1 - y);
                        if (z === 0)
                            new_state.push(
                                [orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'F': [(x, y, z, d) => {
            if (z === n - 1)
                return `0,0,1,${d * 90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + x * n + (n - 1 - y);
                        if (z === n - 1)
                            new_state.push(
                                [orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "F'": [(x, y, z, d) => {
            if (z === n - 1)
                return `0,0,1,${d * -90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + (n - 1 - x) * n + y;
                        if (z === n - 1)
                            new_state.push(
                                [orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'X': [(x, y, z, d) => {
            return `1,0,0,${d * -90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = (n - 1 - y) * n * n + z * n + x;
                        new_state.push(
                            [orientation[t1][2],
                            orientation[t1][1],
                            orientation[t1][3],
                            orientation[t1][5],
                            orientation[t1][4],
                            orientation[t1][0]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(y * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                    }
                }
            }
            return new_depth;
        }],
        "X'": [(x, y, z, d) => {
            return `1,0,0,${d * 90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = y * n * n + (n - 1 - z) * n + x;
                        new_state.push(
                            [orientation[t1][5],
                            orientation[t1][1],
                            orientation[t1][0],
                            orientation[t1][2],
                            orientation[t1][4],
                            orientation[t1][3]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push((n - 1 - y) * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                    }
                }
            }
            return new_depth;
        }],
        "Y'": [(x, y, z, d) => {
            return `0,1,0,${d * 90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = (n - 1 - x) * n * n + y * n + z;
                        new_state.push(
                            [orientation[t1][0],
                            orientation[t1][5],
                            orientation[t1][1],
                            orientation[t1][3],
                            orientation[t1][2],
                            orientation[t1][4]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(x * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'Y': [(x, y, z, d) => {
            return `0,1,0,${d * -90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = x * n * n + y * n + (n - 1 - z);
                        new_state.push(
                            [orientation[t1][0],
                            orientation[t1][2],
                            orientation[t1][4],
                            orientation[t1][3],
                            orientation[t1][5],
                            orientation[t1][1]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push((n - 1 - x) * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "Z'": [(x, y, z, d) => {
            return `0,0,1,${d * 90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = z * n * n + x * n + (n - 1 - y);
                        new_state.push(
                            [orientation[t1][4],
                            orientation[t1][0],
                            orientation[t1][2],
                            orientation[t1][1],
                            orientation[t1][3],
                            orientation[t1][5]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'Z': [(x, y, z, d) => {
            return `0,0,1,${d * -90}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t1 = z * n * n + (n - 1 - x) * n + y;
                        new_state.push(
                            [orientation[t1][1],
                            orientation[t1][3],
                            orientation[t1][2],
                            orientation[t1][4],
                            orientation[t1][0],
                            orientation[t1][5]]
                        );
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'M': [(x, y, z, d) => {
            if (x === 1)
                return `1,0,0,${d * 90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - y) * n * n + z * n + x;
                        if (x === 1)
                            new_state.push(
                                [orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === 1)
                            new_depth.push((n - 1 - y) * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "M'": [(x, y, z, d) => {
            if (x === 1)
                return `1,0,0,${d * -90}deg`;
            else
                return `1,0,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = y * n * n + (n - 1 - z) * n + x;
                        if (x === 1)
                            new_state.push(
                                [orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][4],
                                orientation[t1][0]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (x === 1)
                            new_depth.push(y * 3 - Math.abs(x - 1) - Math.abs(z - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'E': [(x, y, z, d) => {
            if (y === 1)
                return `0,1,0,${d * -90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = x * n * n + y * n + (n - 1 - z);
                        if (y === 1)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][3],
                                orientation[t1][5],
                                orientation[t1][1]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === 1)
                            new_depth.push((n - 1 - x) * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "E'": [(x, y, z, d) => {
            if (y === 1)
                return `0,1,0,${d * 90}deg`;
            else
                return `0,1,0,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = (n - 1 - x) * n * n + y * n + z;
                        if (y === 1)
                            new_state.push(
                                [orientation[t1][0],
                                orientation[t1][5],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        if (y === 1)
                            new_depth.push(x * 3 - Math.abs(z - 1) - Math.abs(y - 1));
                        else
                            new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        'S': [(x, y, z, d) => {
            if (z === 1)
                return `0,0,1,${d * -90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + x * n + (n - 1 - y);
                        if (z === 1)
                            new_state.push(
                                [orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][2],
                                orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }],
        "S'": [(x, y, z, d) => {
            if (z === 1)
                return `0,0,1,${d * 90}deg`;
            else
                return `0,0,1,${0}deg`;
        }, (orientation) => {
            var new_state = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        var t = z * n * n + y * n + x;
                        var t1 = z * n * n + (n - 1 - x) * n + y;
                        if (z === 1)
                            new_state.push(
                                [orientation[t1][1],
                                orientation[t1][3],
                                orientation[t1][2],
                                orientation[t1][4],
                                orientation[t1][0],
                                orientation[t1][5]]
                            );
                        else
                            new_state.push(orientation[t]);
                    }
                }
            }
            return new_state;
        }, () => {
            var new_depth = [];
            for (var z = 0; z < n; z++) {
                for (var y = 0; y < n; y++) {
                    for (var x = 0; x < n; x++) {
                        new_depth.push(z * 3 - Math.abs(x - 1) - Math.abs(y - 1));
                    }
                }
            }
            return new_depth;
        }]
    }
}

export default moves;