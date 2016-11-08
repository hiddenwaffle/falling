/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>

export const enum Key {
    Left,
    Up,
    Down,
    Right,
    Space,
    Pause,
    Other
}

const enum State {
    Down,
    Up,
    Handling
}

class Input {
    private keyState: Map<Key,State>;

    constructor() {
        this.keyState = new Map<Key,State>();
    }

    start() {
        window.addEventListener('keydown', (event) => {
            this.eventToState(event, State.Down);
        });
        window.addEventListener('keyup', (event) => {
            this.eventToState(event, State.Up);
        });
    }

    /**
     * Return if given key is 'Down'.
     */
    isDown(key: Key): boolean {
        return this.keyState.get(key) === State.Down;
    }

    /**
     * Return if given key is 'down'. Also sets the key from 'Down' to 'Handling'.
     */
    isDownAndUnhandled(key: Key): boolean {
        if (this.isDown(key)) {
            this.keyState.set(key, State.Handling);
            return true;
        } else {
            return false; // TODO: This wasn't set in mazing; need to see why.
        }
    }

    /**
     * Returns if any key is 'down'. Also set all 'Down' keys to 'Handling'.
     */
    isAnyKeyDownAndUnhandled() {
        let anyKeyDown = false;
        this.keyState.forEach((state: State, key: Key) => {
            if (state === State.Down) {
                this.keyState.set(key, State.Handling);
                anyKeyDown = true;
            }
        });
        return anyKeyDown;
    }

    private eventToState(event: KeyboardEvent, state: State) {
        switch (event.keyCode) {

            // Directionals --------------------------------------------------
            case 65: // 'a'
            case 37: // left
                this.setState(Key.Left, state);
                event.preventDefault();
                break;
            case 87: // 'w'
            case 38: // up
                this.setState(Key.Up, state);
                // event.preventDefault() - commented for if the user wants to cmd+w or ctrl+w
                break;
            case 68: // 'd'
            case 39: // right
                this.setState(Key.Right, state);
                event.preventDefault();
                break;
            case 83: // 's'
            case 40: // down
                this.setState(Key.Down, state);
                event.preventDefault();
                break;
            case 32: // space
                this.setState(Key.Space, state);
                event.preventDefault();
                break;
            
            // Pause ---------------------------------------------------------
            case 80: // 'p'
            case 27: // esc
            case 13: // enter key
                this.setState(Key.Pause, state);
                event.preventDefault();
                break;
            
            // TODO: Maybe add a debug key here ('f')

            // Ignore certain keys -------------------------------------------
            case 82:    // 'r'
            case 18:    // alt
            case 224:   // apple command (firefox)
            case 17:    // apple command (opera)
            case 91:    // apple command, left (safari/chrome)
            case 93:    // apple command, right (safari/chrome)
            case 84:    // 't' (i.e., open a new tab)
            case 78:    // 'n' (i.e., open a new window)
            case 219:   // left brackets
            case 221:   // right brackets
                break;
            
            // Prevent some unwanted behaviors -------------------------------
            case 191:   // forward slash (page find)
            case 9:     // tab (can lose focus)
            case 16:    // shift
                event.preventDefault();
                break;

            // All other keys ------------------------------------------------
            default:
                this.setState(Key.Other, state);
                break;
        }
    }

    private setState(key: Key, state: State) {
        // Always set 'up'
        if (state === State.Up) {
            this.keyState.set(key, state);
        // Only set 'down' if it is not already handled
        } else if (state === State.Down) {
            if (this.keyState.get(key) !== State.Handling) {
                this.keyState.set(key, state);
            }
        }
    }
}

export const input = new Input();