/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>

const enum Key {
    Left,
    Up,
    Down,
    Right,
    Space,
    Pause
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
                console.log('a or left'); // TODO: setState()
                event.preventDefault();
                break;
            case 87: // 'w'
            case 38: // up
                console.log('w or up'); // TODO: setState()
                // event.preventDefault() - commented for if the user wants to cmd+w or ctrl+w
                break;
            case 68: // 'd'
            case 39: // right
                console.log('d or right'); // TODO: setState()
                event.preventDefault();
                break;
            case 83: // 's'
            case 40: // down
                console.log('s or down'); // TODO: setState()
                event.preventDefault();
                break;
            case 32: // space
                console.log('space'); // TODO: setState()
                event.preventDefault();
                break;
            
            // Pause ---------------------------------------------------------
            case 80: // 'p'
            case 27: // esc
            case 13: // enter key
                console.log('pause'); // TODO: setState()
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
                console.log('other'); // TODO: setState()
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