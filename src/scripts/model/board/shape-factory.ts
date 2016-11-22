import {Shape} from './shape';
import {Color} from '../../domain/color';

class ShapeI extends Shape {
    color = Color.Cyan;
    valuesPerRow = 4;
    startingEligible = true;
    matrices = [
        [
            0, 0, 0, 0,
            1, 1, 1, 1,
            0, 0, 0, 0,
            0, 0, 0, 0
        ],
        [
            0, 0, 1, 0,
            0, 0, 1, 0,
            0, 0, 1, 0,
            0, 0, 1, 0
        ],
        [
            0, 0, 0, 0,
            0, 0, 0, 0,
            1, 1, 1, 1,
            0, 0, 0, 0
        ],
        [
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0
        ]
    ]

    getInstance(): ShapeI {
        return new ShapeI();
    }
}

class ShapeJ extends Shape {
    color = Color.Blue;
    valuesPerRow = 3;
    startingEligible = true;
    matrices = [
        [
            1, 0, 0,
            1, 1, 1,
            0, 0, 0
        ],
        [
            0, 1, 1,
            0, 1, 0,
            0, 1, 0
        ],
        [
            0, 0, 0,
            1, 1, 1,
            0, 0, 1
        ],
        [
            0, 1, 0,
            0, 1, 0,
            1, 1, 0
        ]
    ];

    getInstance(): ShapeJ {
        return new ShapeJ();
    }
}

class ShapeL extends Shape {
    color = Color.Orange;
    valuesPerRow = 3;
    startingEligible = true;
    matrices = [
        [
            0, 0, 1,
            1, 1, 1,
            0, 0, 0
        ],
        [
            0, 1, 0,
            0, 1, 0,
            0, 1, 1
        ],
        [
            0, 0, 0,
            1, 1, 1,
            1, 0, 0
        ],
        [
            1, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]
    ]

    getInstance(): ShapeL {
        return new ShapeL();
    }
}

class ShapeO extends Shape {
    color = Color.Yellow;
    valuesPerRow = 4;
    startingEligible = false;
    matrices = [
        [
            0, 1, 1, 0,
            0, 1, 1, 0,
            0, 0, 0, 0
        ]
    ]

    getInstance(): ShapeO {
        return new ShapeO();
    }
}

class ShapeS extends Shape {
    color = Color.Green;
    valuesPerRow = 3;
    startingEligible = false;
    matrices = [
        [
            0, 1, 1,
            1, 1, 0,
            0, 0, 0
        ],
        [
            0, 1, 0,
            0, 1, 1,
            0, 0, 1
        ],
        [
            0, 0, 0,
            0, 1, 1,
            1, 1, 0
        ],
        [
            1, 0, 0,
            1, 1, 0,
            0, 1, 0
        ]
    ]

    getInstance(): ShapeS {
        return new ShapeS();
    }
}

class ShapeT extends Shape {
    color = Color.Purple;
    valuesPerRow = 3;
    startingEligible = true;
    matrices = [
        [
            0, 1, 0,
            1, 1, 1,
            0, 0, 0
        ],
        [
            0, 1, 0,
            0, 1, 1,
            0, 1, 0
        ],
        [
            0, 0, 0,
            1, 1, 1,
            0, 1, 0
        ],
        [
            0, 1, 0,
            1, 1, 0,
            0, 1, 0
        ]
    ]

    getInstance(): ShapeT {
        return new ShapeT();
    }
}

class ShapeZ extends Shape {
    color = Color.Red;
    valuesPerRow = 3;
    startingEligible = false;
    matrices = [
        [
            1, 1, 0,
            0, 1, 1,
            0, 0, 0
        ],
        [
            0, 0, 1,
            0, 1, 1,
            0, 1, 0
        ],
        [
            0, 0, 0,
            1, 1, 0,
            0, 1, 1
        ],
        [
            0, 1, 0,
            1, 1, 0,
            1, 0, 0
        ]
    ]

    getInstance(): ShapeZ {
        return new ShapeZ();
    }
}

export class ShapeFactory {
    private bag: Shape[];

    constructor() {
        this.refillBag(true);
    }

    nextShape(forceBagRefill: boolean) {
        if (this.bag.length <= 0 || forceBagRefill === true) {
            this.refillBag(forceBagRefill);
        }
        return this.bag.pop(); // Get from end of array.
    }

    private refillBag(startingPieceAsFirst: boolean) {
        this.bag = [
            new ShapeI(),
            new ShapeJ(),
            new ShapeL(),
            new ShapeT(),
            new ShapeO(),
            new ShapeS(),
            new ShapeZ()
        ];

        {
            // Fisher-Yates Shuffle, based on: http://stackoverflow.com/a/2450976
            let idx = this.bag.length
            // While there remain elements to shuffle...
            while (0 !== idx) {
                // Pick a remaining element...
                let rndIdx = Math.floor(Math.random() * idx);
                idx -= 1;
                // And swap it with the current element.
                let tempVal = this.bag[idx];
                this.bag[idx] = this.bag[rndIdx];
                this.bag[rndIdx] = tempVal;
            }
        }

        // Only certain shapes can be dropped onto what could be a blank or almost-blank grid.
        if (startingPieceAsFirst === true) {
            let lastIdx = this.bag.length - 1;
            if (this.bag[lastIdx].startingEligible === true) {
                // Do not need to do anything.
            } else {
                for (let idx = 0; idx < lastIdx; idx++) {
                    if (this.bag[idx].startingEligible === true) {
                        let tempVal = this.bag[lastIdx];
                        this.bag[lastIdx] = this.bag[idx];
                        this.bag[idx] = tempVal;
                        break;
                    }
                }
            }
        }
    }
}
export const deadShapeFactory = new ShapeFactory(); // Used by AI.