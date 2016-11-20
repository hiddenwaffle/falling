import {Shape} from './shape';
import {Color} from '../../domain/color';

class ShapeI extends Shape {
    spawnColumn = 3;
    color = Color.Cyan;
    valuesPerRow = 4;
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
}

class ShapeJ extends Shape {
    color = Color.Blue;
    valuesPerRow = 3;
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
}

class ShapeL extends Shape {
    color = Color.Orange;
    valuesPerRow = 3;
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
}

class ShapeO extends Shape {
    color = Color.Yellow;
    valuesPerRow = 4;
    matrices = [
        [
            0, 1, 1, 0,
            0, 1, 1, 0,
            0, 0, 0, 0
        ]
    ]
}

class ShapeS extends Shape {
    color = Color.Green;
    valuesPerRow = 3;
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
}

class ShapeT extends Shape {
    color = Color.Purple;
    valuesPerRow = 3;
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
}

class ShapeZ extends Shape {
    color = Color.Red;
    valuesPerRow = 3;
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
        return this.bag.pop();
    }

    private refillBag(startingPiecesOnly: boolean) {
        console.log('test: ' + startingPiecesOnly);
        this.bag = [
            new ShapeI(),
            new ShapeJ(),
            new ShapeL(),
            new ShapeT(),
        ];

        if (startingPiecesOnly === false) {
            this.bag.push(
                new ShapeO(),
                new ShapeS(),
                new ShapeZ()
            );
        }

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
}
