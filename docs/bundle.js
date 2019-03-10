(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var keyboard_1 = require('./keyboard');
var game_state_1 = require('../game-state');
var intro_handler_1 = require('./intro-handler');
var playing_handler_1 = require('./playing-handler');
var Controller = (function () {
    function Controller() {
    }
    Controller.prototype.start = function () {
        keyboard_1.keyboard.start();
        playing_handler_1.playingHandler.start();
    };
    Controller.prototype.step = function (elapsed) {
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                intro_handler_1.introHandler.step(elapsed);
                break;
            case 3 /* Playing */:
                playing_handler_1.playingHandler.step(elapsed);
                break;
            case 4 /* Ended */:
                // NOTE: End of game, no more input necessary.
                break;
            default:
                console.log('should not get here');
        }
    };
    return Controller;
}());
exports.controller = new Controller();
},{"../game-state":25,"./intro-handler":2,"./keyboard":3,"./playing-handler":4}],2:[function(require,module,exports){
"use strict";
var keyboard_1 = require('./keyboard');
var event_bus_1 = require('../event/event-bus');
var intro_key_pressed_event_1 = require('../event/intro-key-pressed-event');
var IntroHandler = (function () {
    function IntroHandler() {
    }
    IntroHandler.prototype.start = function () {
        //
    };
    IntroHandler.prototype.step = function (elapsed) {
        keyboard_1.keyboard.step(elapsed);
        if (keyboard_1.keyboard.isAnyKeyDownAndUnhandled()) {
            event_bus_1.eventBus.fire(new intro_key_pressed_event_1.IntroKeyPressedEvent());
        }
    };
    return IntroHandler;
}());
exports.introHandler = new IntroHandler();
},{"../event/event-bus":12,"../event/intro-key-pressed-event":16,"./keyboard":3}],3:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var KEY_REPEAT_DELAY_INITIAL = 550;
var KEY_REPEAT_DELAY_CONTINUE = 200;
var Keyboard = (function () {
    function Keyboard() {
        // See onblur handler below for more comments.
        this.keyState = new Map();
        this.previousKeyCode = -1;
        this.currentKeyCode = -1;
        this.keyHeldElapsed = 0;
        this.keyHeldInitial = true;
    }
    Keyboard.prototype.start = function () {
        var _this = this;
        window.addEventListener('keydown', function (event) {
            _this.eventToState(event, 0 /* Down */);
        });
        window.addEventListener('keyup', function (event) {
            _this.eventToState(event, 1 /* Up */);
        });
        // Prevent "stuck" key if held down and window loses focus.
        window.onblur = function () {
            // Just re-initailize everything like the constructor
            _this.keyState = new Map();
            _this.previousKeyCode = -1;
            _this.currentKeyCode = -1;
            _this.keyHeldElapsed = 0;
            _this.keyHeldInitial = false;
        };
    };
    /**
     * All this does is handle if the player is holding down a key for a certain amount of time.
     * If so, determine whether or not to emulate their having pressed the key during this frame.
     */
    Keyboard.prototype.step = function (elapsed) {
        if (this.currentKeyCode !== this.previousKeyCode) {
            this.keyHeldElapsed += elapsed;
            var updateState = void 0;
            if (this.keyHeldInitial === true && this.keyHeldElapsed >= KEY_REPEAT_DELAY_INITIAL) {
                this.keyHeldInitial = false;
                this.keyHeldElapsed = 0;
                updateState = true;
            }
            else if (this.keyHeldInitial === false && this.keyHeldElapsed >= KEY_REPEAT_DELAY_CONTINUE) {
                this.keyHeldElapsed = 0;
                updateState = true;
            }
            if (updateState === true) {
                var key = this.keyCodeToKey(this.currentKeyCode);
                this.setState(key, 0 /* Down */, true);
            }
        }
        else {
            this.keyHeldElapsed = 0;
            this.keyHeldInitial = true;
        }
    };
    /**
     * Return if given key is 'Down'.
     */
    Keyboard.prototype.isDown = function (key) {
        return this.keyState.get(key) === 0 /* Down */;
    };
    /**
     * Return if given key is 'down'. Also sets the key from 'Down' to 'Handling'.
     */
    Keyboard.prototype.isDownAndUnhandled = function (key) {
        if (this.isDown(key)) {
            this.keyState.set(key, 2 /* Handling */);
            return true;
        }
        else {
            return false; // TODO: This wasn't set in mazing; need to see why.
        }
    };
    /**
     * TODO: Not sure if this would work in this game with the key delay capturing.
     *
     * Returns if any key is 'down'. Also set all 'Down' keys to 'Handling'.
     */
    Keyboard.prototype.isAnyKeyDownAndUnhandled = function () {
        var _this = this;
        var anyKeyDown = false;
        this.keyState.forEach(function (state, key) {
            if (state === 0 /* Down */) {
                _this.keyState.set(key, 2 /* Handling */);
                anyKeyDown = true;
            }
        });
        return anyKeyDown;
    };
    Keyboard.prototype.eventToState = function (event, state) {
        if (state === 0 /* Down */) {
            this.currentKeyCode = event.keyCode;
        }
        else if (state == 1 /* Up */) {
            this.currentKeyCode = -1;
            this.previousKeyCode = -1;
        }
        var key = this.keyCodeToKey(event.keyCode);
        this.keyToState(key, state, event);
    };
    Keyboard.prototype.keyCodeToKey = function (keyCode) {
        var key = 6 /* Other */;
        switch (keyCode) {
            // Directionals --------------------------------------------------
            case 65: // 'a'
            case 37:
                key = 0 /* Left */;
                break;
            case 87: // 'w'
            case 38:
                key = 1 /* Up */;
                break;
            case 68: // 'd'
            case 39:
                key = 3 /* Right */;
                break;
            case 83: // 's'
            case 40:
                key = 2 /* Down */;
                break;
            case 32:
                key = 4 /* Drop */;
                break;
            // Pause ---------------------------------------------------------
            case 80: // 'p'
            case 27: // esc
            case 13:
                key = 5 /* Pause */;
                break;
            // Ignore certain keys -------------------------------------------
            case 82: // 'r'
            case 18: // alt
            case 224: // apple command (firefox)
            case 17: // apple command (opera)
            case 91: // apple command, left (safari/chrome)
            case 93: // apple command, right (safari/chrome)
            case 84: // 't' (i.e., open a new tab)
            case 78: // 'n' (i.e., open a new window)
            case 219: // left brackets
            case 221:
                key = 7 /* Ignore */;
                break;
            // Prevent some unwanted behaviors -------------------------------
            case 191: // forward slash (page find)
            case 9: // tab (can lose focus)
            case 16:
                key = 8 /* Prevent */;
                break;
            // All other keys ------------------------------------------------
            default:
                key = 6 /* Other */;
        }
        return key;
    };
    Keyboard.prototype.keyToState = function (key, state, event) {
        var preventDefault = false;
        switch (key) {
            case 0 /* Left */:
                this.setState(0 /* Left */, state);
                preventDefault = true;
                break;
            case 1 /* Up */:
                this.setState(1 /* Up */, state);
                // event.preventDefault() - commented for if the user wants to cmd+w or ctrl+w
                break;
            case 3 /* Right */:
                this.setState(3 /* Right */, state);
                preventDefault = true;
                break;
            case 2 /* Down */:
                this.setState(2 /* Down */, state);
                preventDefault = true;
                break;
            case 4 /* Drop */:
                this.setState(4 /* Drop */, state);
                preventDefault = true;
                break;
            case 5 /* Pause */:
                this.setState(5 /* Pause */, state);
                preventDefault = true;
                break;
            // TODO: Maybe add a debug key here ('f')
            case 7 /* Ignore */:
                break;
            case 8 /* Prevent */:
                preventDefault = true;
                break;
            case 6 /* Other */:
            default:
                this.setState(6 /* Other */, state);
                break;
        }
        if (event != null && preventDefault === true) {
            event.preventDefault();
        }
    };
    Keyboard.prototype.setState = function (key, state, force) {
        if (force === void 0) { force = false; }
        // Always set 'up'
        if (state === 1 /* Up */) {
            this.keyState.set(key, state);
        }
        else if (state === 0 /* Down */) {
            if (this.keyState.get(key) !== 2 /* Handling */ || force === true) {
                this.keyState.set(key, state);
            }
        }
    };
    return Keyboard;
}());
exports.keyboard = new Keyboard();
},{}],4:[function(require,module,exports){
"use strict";
var keyboard_1 = require('./keyboard');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var player_movement_event_1 = require('../event/player-movement-event');
var PlayingHandler = (function () {
    function PlayingHandler() {
    }
    PlayingHandler.prototype.start = function () {
        //
    };
    PlayingHandler.prototype.step = function (elapsed) {
        keyboard_1.keyboard.step(elapsed);
        if (keyboard_1.keyboard.isDownAndUnhandled(1 /* Up */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.RotateClockwise, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(0 /* Left */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Left, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(3 /* Right */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Right, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(2 /* Down */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Down, 0 /* Human */));
        }
        if (keyboard_1.keyboard.isDownAndUnhandled(4 /* Drop */)) {
            event_bus_1.eventBus.fire(new player_movement_event_1.PlayerMovementEvent(player_movement_1.PlayerMovement.Drop, 0 /* Human */));
        }
    };
    return PlayingHandler;
}());
exports.playingHandler = new PlayingHandler();
},{"../domain/player-movement":7,"../event/event-bus":12,"../event/player-movement-event":21,"./keyboard":3}],5:[function(require,module,exports){
"use strict";
var Cell = (function () {
    function Cell() {
        this.color = 0 /* Empty */;
    }
    Cell.prototype.setColor = function (color) {
        this.color = color;
    };
    Cell.prototype.getColor = function () {
        return this.color;
    };
    return Cell;
}());
exports.Cell = Cell;
/**
 * Offset calculated from top-left corner being 0, 0.
 */
var CellOffset = (function () {
    function CellOffset(x, y) {
        this.x = x;
        this.y = y;
    }
    return CellOffset;
}());
exports.CellOffset = CellOffset;
},{}],6:[function(require,module,exports){
"use strict";
exports.PANEL_COUNT_PER_FLOOR = 10;
exports.TIME_UNTIL_EVERYONE_ON_SCREEN = 105 * 1000;
exports.AMBIENCE_NIGHT = 'AMBIENCE_NIGHT';
exports.MUSIC_OPENING = 'MUSIC_OPENING';
exports.MUSIC_MAIN = 'MUSIC_MAIN';
exports.MUSIC_MAIN_VOX = 'MUSIC_MAIN_VOX';
exports.STUDENTS_TALKING = 'STUDENTS_TALKING';
exports.CHEERING = 'CHEERING';
exports.CLAPPING = 'CLAPPING';
},{}],7:[function(require,module,exports){
"use strict";
(function (PlayerMovement) {
    PlayerMovement[PlayerMovement["None"] = 0] = "None";
    PlayerMovement[PlayerMovement["Left"] = 1] = "Left";
    PlayerMovement[PlayerMovement["Right"] = 2] = "Right";
    PlayerMovement[PlayerMovement["Down"] = 3] = "Down";
    PlayerMovement[PlayerMovement["Drop"] = 4] = "Drop";
    PlayerMovement[PlayerMovement["RotateClockwise"] = 5] = "RotateClockwise";
    PlayerMovement[PlayerMovement["RotateCounterClockwise"] = 6] = "RotateCounterClockwise";
})(exports.PlayerMovement || (exports.PlayerMovement = {}));
var PlayerMovement = exports.PlayerMovement;
},{}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var ActiveShapeChangedEvent = (function (_super) {
    __extends(ActiveShapeChangedEvent, _super);
    function ActiveShapeChangedEvent(shape, playerType, starting) {
        _super.call(this);
        this.shape = shape;
        this.playerType = playerType;
        this.starting = starting;
    }
    ActiveShapeChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.ActiveShapeChangedEventType;
    };
    return ActiveShapeChangedEvent;
}(event_bus_1.AbstractEvent));
exports.ActiveShapeChangedEvent = ActiveShapeChangedEvent;
},{"./event-bus":12}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var ActiveShapeEndedEvent = (function (_super) {
    __extends(ActiveShapeEndedEvent, _super);
    function ActiveShapeEndedEvent(playerType, rowIdx) {
        _super.call(this);
        this.playerType = playerType;
        this.rowIdx = rowIdx;
    }
    ActiveShapeEndedEvent.prototype.getType = function () {
        return event_bus_1.EventType.ActiveShapeEndedEventType;
    };
    return ActiveShapeEndedEvent;
}(event_bus_1.AbstractEvent));
exports.ActiveShapeEndedEvent = ActiveShapeEndedEvent;
},{"./event-bus":12}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var BoardFilledEvent = (function (_super) {
    __extends(BoardFilledEvent, _super);
    function BoardFilledEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    BoardFilledEvent.prototype.getType = function () {
        return event_bus_1.EventType.BoardFilledEventType;
    };
    return BoardFilledEvent;
}(event_bus_1.AbstractEvent));
exports.BoardFilledEvent = BoardFilledEvent;
},{"./event-bus":12}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var CellChangeEvent = (function (_super) {
    __extends(CellChangeEvent, _super);
    function CellChangeEvent(cell, row, col, playerType) {
        _super.call(this);
        this.cell = cell;
        this.row = row;
        this.col = col;
        this.playerType = playerType;
    }
    CellChangeEvent.prototype.getType = function () {
        return event_bus_1.EventType.CellChangeEventType;
    };
    return CellChangeEvent;
}(event_bus_1.AbstractEvent));
exports.CellChangeEvent = CellChangeEvent;
},{"./event-bus":12}],12:[function(require,module,exports){
"use strict";
(function (EventType) {
    EventType[EventType["ActiveShapeChangedEventType"] = 0] = "ActiveShapeChangedEventType";
    EventType[EventType["ActiveShapeEndedEventType"] = 1] = "ActiveShapeEndedEventType";
    EventType[EventType["BoardFilledEventType"] = 2] = "BoardFilledEventType";
    EventType[EventType["CellChangeEventType"] = 3] = "CellChangeEventType";
    EventType[EventType["FallingSequencerEventType"] = 4] = "FallingSequencerEventType";
    EventType[EventType["GameStateChangedType"] = 5] = "GameStateChangedType";
    EventType[EventType["HpChangedEventType"] = 6] = "HpChangedEventType";
    EventType[EventType["IntroKeyPressedEventType"] = 7] = "IntroKeyPressedEventType";
    EventType[EventType["NpcFacingEventType"] = 8] = "NpcFacingEventType";
    EventType[EventType["NpcMovementChangedEventType"] = 9] = "NpcMovementChangedEventType";
    EventType[EventType["NpcPlacedEventType"] = 10] = "NpcPlacedEventType";
    EventType[EventType["NpcStateChagedEventType"] = 11] = "NpcStateChagedEventType";
    EventType[EventType["NpcTeleportedEventType"] = 12] = "NpcTeleportedEventType";
    EventType[EventType["PlayerMovementEventType"] = 13] = "PlayerMovementEventType";
    EventType[EventType["RowsClearAnimationCompletedEventType"] = 14] = "RowsClearAnimationCompletedEventType";
    EventType[EventType["RowsFilledEventType"] = 15] = "RowsFilledEventType";
    EventType[EventType["StandeeMovementEndedEventType"] = 16] = "StandeeMovementEndedEventType";
})(exports.EventType || (exports.EventType = {}));
var EventType = exports.EventType;
var AbstractEvent = (function () {
    function AbstractEvent() {
    }
    return AbstractEvent;
}());
exports.AbstractEvent = AbstractEvent;
var EventBus = (function () {
    function EventBus() {
        this.handlersByType = new Map();
    }
    EventBus.prototype.register = function (type, handler) {
        if (!type) {
        }
        if (!handler) {
        }
        var handlers = this.handlersByType.get(type);
        if (handlers === undefined) {
            handlers = [];
            this.handlersByType.set(type, handlers);
        }
        handlers.push(handler);
        // TODO: Return a function that can be called to unregister the handler
    };
    // TODO: unregister(). And remove the map key if zero handlers left for it.
    // TODO: Prevent infinite fire()?
    EventBus.prototype.fire = function (event) {
        var handlers = this.handlersByType.get(event.getType());
        if (handlers !== undefined) {
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var handler = handlers_1[_i];
                handler(event);
            }
        }
    };
    return EventBus;
}());
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
exports.deadEventBus = new EventBus(); // Used by AI.
},{}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var FallingSequencerEvent = (function (_super) {
    __extends(FallingSequencerEvent, _super);
    function FallingSequencerEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    FallingSequencerEvent.prototype.getType = function () {
        return event_bus_1.EventType.FallingSequencerEventType;
    };
    return FallingSequencerEvent;
}(event_bus_1.AbstractEvent));
exports.FallingSequencerEvent = FallingSequencerEvent;
},{"./event-bus":12}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var GameStateChangedEvent = (function (_super) {
    __extends(GameStateChangedEvent, _super);
    function GameStateChangedEvent(type) {
        _super.call(this);
        this.gameStateType = type;
    }
    GameStateChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.GameStateChangedType;
    };
    return GameStateChangedEvent;
}(event_bus_1.AbstractEvent));
exports.GameStateChangedEvent = GameStateChangedEvent;
},{"./event-bus":12}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var HpChangedEvent = (function (_super) {
    __extends(HpChangedEvent, _super);
    function HpChangedEvent(hp, playerType, blinkLost) {
        if (blinkLost === void 0) { blinkLost = false; }
        _super.call(this);
        this.hp = hp;
        this.playerType = playerType;
        this.blinkLost = blinkLost;
    }
    HpChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.HpChangedEventType;
    };
    return HpChangedEvent;
}(event_bus_1.AbstractEvent));
exports.HpChangedEvent = HpChangedEvent;
},{"./event-bus":12}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var IntroKeyPressedEvent = (function (_super) {
    __extends(IntroKeyPressedEvent, _super);
    function IntroKeyPressedEvent() {
        _super.apply(this, arguments);
    }
    IntroKeyPressedEvent.prototype.getType = function () {
        return event_bus_1.EventType.IntroKeyPressedEventType;
    };
    return IntroKeyPressedEvent;
}(event_bus_1.AbstractEvent));
exports.IntroKeyPressedEvent = IntroKeyPressedEvent;
},{"./event-bus":12}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcFacingEvent = (function (_super) {
    __extends(NpcFacingEvent, _super);
    function NpcFacingEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcFacingEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcFacingEventType;
    };
    return NpcFacingEvent;
}(event_bus_1.AbstractEvent));
exports.NpcFacingEvent = NpcFacingEvent;
},{"./event-bus":12}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcMovementChangedEvent = (function (_super) {
    __extends(NpcMovementChangedEvent, _super);
    function NpcMovementChangedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcMovementChangedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcMovementChangedEventType;
    };
    return NpcMovementChangedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcMovementChangedEvent = NpcMovementChangedEvent;
},{"./event-bus":12}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcPlacedEvent = (function (_super) {
    __extends(NpcPlacedEvent, _super);
    function NpcPlacedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcPlacedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcPlacedEventType;
    };
    return NpcPlacedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcPlacedEvent = NpcPlacedEvent;
},{"./event-bus":12}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var NpcTeleportedEvent = (function (_super) {
    __extends(NpcTeleportedEvent, _super);
    function NpcTeleportedEvent(npcId, x, y) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }
    NpcTeleportedEvent.prototype.getType = function () {
        return event_bus_1.EventType.NpcTeleportedEventType;
    };
    return NpcTeleportedEvent;
}(event_bus_1.AbstractEvent));
exports.NpcTeleportedEvent = NpcTeleportedEvent;
},{"./event-bus":12}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var PlayerMovementEvent = (function (_super) {
    __extends(PlayerMovementEvent, _super);
    function PlayerMovementEvent(movement, playerType) {
        _super.call(this);
        this.movement = movement;
        this.playerType = playerType;
    }
    PlayerMovementEvent.prototype.getType = function () {
        return event_bus_1.EventType.PlayerMovementEventType;
    };
    return PlayerMovementEvent;
}(event_bus_1.AbstractEvent));
exports.PlayerMovementEvent = PlayerMovementEvent;
},{"./event-bus":12}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsClearAnimationCompletedEvent = (function (_super) {
    __extends(RowsClearAnimationCompletedEvent, _super);
    function RowsClearAnimationCompletedEvent(playerType) {
        _super.call(this);
        this.playerType = playerType;
    }
    RowsClearAnimationCompletedEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsClearAnimationCompletedEventType;
    };
    return RowsClearAnimationCompletedEvent;
}(event_bus_1.AbstractEvent));
exports.RowsClearAnimationCompletedEvent = RowsClearAnimationCompletedEvent;
},{"./event-bus":12}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var RowsFilledEvent = (function (_super) {
    __extends(RowsFilledEvent, _super);
    function RowsFilledEvent(filledRowIdxs, playerType) {
        _super.call(this);
        this.filledRowIdxs = filledRowIdxs.slice(0);
        this.playerType = playerType;
    }
    RowsFilledEvent.prototype.getType = function () {
        return event_bus_1.EventType.RowsFilledEventType;
    };
    return RowsFilledEvent;
}(event_bus_1.AbstractEvent));
exports.RowsFilledEvent = RowsFilledEvent;
},{"./event-bus":12}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_bus_1 = require('./event-bus');
var StandeeMovementEndedEvent = (function (_super) {
    __extends(StandeeMovementEndedEvent, _super);
    function StandeeMovementEndedEvent(npcId, x, z) {
        _super.call(this);
        this.npcId = npcId;
        this.x = x;
        this.z = z;
    }
    StandeeMovementEndedEvent.prototype.getType = function () {
        return event_bus_1.EventType.StandeeMovementEndedEventType;
    };
    return StandeeMovementEndedEvent;
}(event_bus_1.AbstractEvent));
exports.StandeeMovementEndedEvent = StandeeMovementEndedEvent;
},{"./event-bus":12}],25:[function(require,module,exports){
"use strict";
var event_bus_1 = require('./event/event-bus');
var game_state_changed_event_1 = require('./event/game-state-changed-event');
var GameState = (function () {
    function GameState() {
        this.current = 0 /* Initializing */; // Default state.
    }
    GameState.prototype.getCurrent = function () {
        return this.current;
    };
    GameState.prototype.setCurrent = function (current) {
        this.current = current;
        event_bus_1.eventBus.fire(new game_state_changed_event_1.GameStateChangedEvent(current));
    };
    return GameState;
}());
exports.gameState = new GameState();
},{"./event/event-bus":12,"./event/game-state-changed-event":14}],26:[function(require,module,exports){
"use strict";
var preloader_1 = require('./preloader');
var model_1 = require('./model/model');
var view_1 = require('./view/view');
var controller_1 = require('./controller/controller');
var sound_manager_1 = require('./sound/sound-manager');
var game_state_1 = require('./game-state');
document.addEventListener('DOMContentLoaded', function (event) {
    game_state_1.gameState.setCurrent(0 /* Initializing */);
    sound_manager_1.soundManager.attach();
    preloader_1.preloader.preload(function () {
        main();
    });
});
function main() {
    // Startup in reverse MVC order to ensure that event bus handlers in the
    // controller and view receive (any) start events from model.start().
    sound_manager_1.soundManager.start();
    controller_1.controller.start();
    view_1.view.start();
    model_1.model.start();
    game_state_1.gameState.setCurrent(2 /* Intro */);
    var step = function () {
        requestAnimationFrame(step);
        var elapsed = calculateElapsed();
        controller_1.controller.step(elapsed);
        view_1.view.step(elapsed);
        model_1.model.step(elapsed);
        sound_manager_1.soundManager.step(elapsed);
    };
    step();
}
var lastStep = Date.now();
function calculateElapsed() {
    var now = Date.now();
    var elapsed = now - lastStep;
    if (elapsed > 100) {
        elapsed = 100; // enforce speed limit
    }
    lastStep = now;
    return elapsed;
}
},{"./controller/controller":1,"./game-state":25,"./model/model":35,"./preloader":42,"./sound/sound-manager":44,"./view/view":56}],27:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var event_bus_1 = require('../../event/event-bus');
var vitals_1 = require('../vitals');
var MAX_COLS = constants_1.PANEL_COUNT_PER_FLOOR;
/**
 * How long to wait before manipulating a shape that has just come into play.
 */
var TIME_DELAY = 500;
/**
 * How long to wait before manipulating the shape that is in play.
 */
var TIME_BETWEEN_MOVES = 200;
// These constants are for timing how long to wait before dropping shape, since the start of the shape.
var TIME_FASTEST_TILL_DROP = 2850;
var TIME_SLOWEST_TILL_DROP = 4850;
var RANGE_TIME_TILL_DROP = TIME_SLOWEST_TILL_DROP - TIME_FASTEST_TILL_DROP;
/**
 * Adds some variation to TIME_BETWEEN_MOVES
 */
var TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES = 100;
var Ai = (function () {
    function Ai(realBoard) {
        this.realBoard = realBoard;
        this.timeUntilNextMove = this.calculateTimeUntilNextMove();
        this.delayTtl = 0;
        this.timeTillDrop = TIME_SLOWEST_TILL_DROP;
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.targetColIdx = 0;
        this.moveCompleted = false;
    }
    Ai.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
    };
    Ai.prototype.step = function (elapsed) {
        this.timeTillDrop -= elapsed;
        if (this.delayTtl > 0) {
            this.delayTtl -= elapsed;
        }
        else {
            this.timeUntilNextMove -= elapsed;
            if (this.timeUntilNextMove <= 0) {
                this.timeUntilNextMove = this.calculateTimeUntilNextMove();
                this.advanceTowardsTarget();
            }
        }
    };
    /**
     * This method provides a high-level view of the AI's thought process.
     */
    Ai.prototype.strategize = function () {
        // Part 1 - Determine how long this move should be, based on current score.
        {
            // Higher means human is winning.
            var diff = vitals_1.vitals.humanHitPoints - vitals_1.vitals.aiHitPoints;
            var pct = (vitals_1.MAX_HP - diff) / (vitals_1.MAX_HP * 2);
            this.timeTillDrop = TIME_FASTEST_TILL_DROP + (pct * RANGE_TIME_TILL_DROP);
        }
        // Part 2 - Determine how to fit the given shape.
        {
            var zombie = this.realBoard.cloneZombie();
            // Iterate through all possible rotations and columns
            var bestFitness = Number.MIN_SAFE_INTEGER;
            var bestRotation = 0;
            var bestColIdx = 0;
            for (var rotation = 0; rotation < 4; rotation++) {
                while (zombie.moveShapeLeft())
                    ;
                for (var idx = 0; idx < MAX_COLS; idx++) {
                    zombie.moveShapeDownAllTheWay();
                    zombie.convertShapeToCells();
                    var fitness = this.calculateFitness(zombie);
                    if (fitness > bestFitness) {
                        bestFitness = fitness;
                        bestRotation = rotation;
                        bestColIdx = zombie.getCurrentShapeColIdx(); // Use this rather than idx in case it was off because of whatever reason (obstruction, wall, etc...)
                    }
                    zombie.undoConvertShapeToCells();
                    zombie.moveToTop();
                    var canMoveRight = zombie.moveShapeRight();
                    if (canMoveRight === false) {
                        break;
                    }
                }
                zombie.rotateShapeClockwise();
            }
            // Finally, set the values that will let the AI advance towards the target.
            this.targetRotation = bestRotation;
            this.currentRotation = 0;
            this.targetColIdx = bestColIdx;
            this.moveCompleted = false;
        }
    };
    Ai.prototype.handleActiveShapeChangedEvent = function (event) {
        if (event.playerType === 1 /* Ai */) {
            if (event.starting === true) {
                this.delayTtl = TIME_DELAY;
            }
        }
        else {
        }
    };
    /**
     * Based on https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/
     */
    Ai.prototype.calculateFitness = function (zombie) {
        var aggregateHeight = zombie.calculateAggregateHeight();
        var completeLines = zombie.calculateCompleteLines();
        var holes = zombie.calculateHoles();
        var bumpiness = zombie.calculateBumpiness();
        var fitness = (-0.510066 * aggregateHeight)
            + (0.760666 * completeLines)
            + (-0.35663 * holes)
            + (-0.184483 * bumpiness);
        return fitness;
    };
    Ai.prototype.advanceTowardsTarget = function () {
        if (this.moveCompleted === true) {
            return;
        }
        if (this.currentRotation === this.targetRotation && this.realBoard.getCurrentShapeColIdx() === this.targetColIdx) {
            if (this.timeTillDrop <= 0) {
                this.realBoard.moveShapeDownAllTheWay();
                this.currentRotation = 0;
                this.targetColIdx = 0;
                this.moveCompleted = true;
            }
            else {
            }
        }
        else {
            if (this.currentRotation < this.targetRotation) {
                this.realBoard.rotateShapeClockwise();
                this.currentRotation++;
            }
            if (this.realBoard.getCurrentShapeColIdx() < this.targetColIdx) {
                this.realBoard.moveShapeRight();
            }
            else if (this.realBoard.getCurrentShapeColIdx() > this.targetColIdx) {
                this.realBoard.moveShapeLeft();
            }
        }
    };
    Ai.prototype.calculateTimeUntilNextMove = function () {
        return Math.floor(TIME_BETWEEN_MOVES + (Math.random() * TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES));
    };
    return Ai;
}());
exports.Ai = Ai;
},{"../../domain/constants":6,"../../event/event-bus":12,"../vitals":41}],28:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var constants_1 = require('../../domain/constants');
var shape_factory_1 = require('./shape-factory');
var event_bus_1 = require('../../event/event-bus');
var cell_change_event_1 = require('../../event/cell-change-event');
var rows_filled_event_1 = require('../../event/rows-filled-event');
var active_shape_changed_event_1 = require('../../event/active-shape-changed-event');
var active_shape_ended_event_1 = require('../../event/active-shape-ended-event');
var board_filled_event_1 = require('../../event/board-filled-event');
var win_1 = require('./win');
var MAX_ROWS = 19; // Top 2 rows are obstructed from view. Also, see lighting-grid.ts.
var MAX_COLS = constants_1.PANEL_COUNT_PER_FLOOR;
var TEMP_DELAY_MS = 500;
var Board = (function () {
    function Board(playerType, shapeFactory, eventBus) {
        this.playerType = playerType;
        this.shapeFactory = shapeFactory;
        this.eventBus = eventBus;
        this.boardState = 0 /* Paused */;
        this.msTillGravityTick = TEMP_DELAY_MS;
        this.currentShape = null;
        this.matrix = [];
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new cell_1.Cell();
            }
        }
        if (playerType === 0 /* Human */) {
            this.junkRowHoleColumn = 0;
        }
        else {
            this.junkRowHoleColumn = MAX_COLS - 1;
        }
        this.junkRowHoleDirection = 1;
        this.junkRowColor1 = 8 /* White */;
        this.junkRowColor2 = 8 /* White */;
        this.junkRowColorIdx = 0;
        this.endedStepElapsed = 0;
        this.endedOffset = MAX_ROWS - 1;
    }
    Board.prototype.resetAndPlay = function (play) {
        if (play === void 0) { play = true; }
        this.clear();
        if (play) {
            this.boardState = 1 /* InPlay */;
            this.startShape(true);
        }
    };
    /**
     * This gives a high level view of the main game loop.
     * This shouldn't be called by the AI.
     */
    Board.prototype.step = function (elapsed) {
        if (this.boardState === 0 /* Paused */) {
            // This is here just to ensure that the method to runs immediately after unpausing.
            this.msTillGravityTick = 0;
        }
        else if (this.boardState === 1 /* InPlay */) {
            this.msTillGravityTick -= elapsed;
            if (this.msTillGravityTick <= 0) {
                this.msTillGravityTick = TEMP_DELAY_MS;
                if (this.tryGravity()) {
                    this.moveShapeDown();
                }
                else {
                    this.handleEndOfCurrentPieceTasks();
                }
            }
        }
        else if (this.boardState === 2 /* Win */) {
            this.handleEnded(elapsed);
        }
        else if (this.boardState === 3 /* Lose */) {
        }
    };
    /**
     * Call this once a shape is known to be in its final resting position.
     */
    Board.prototype.handleEndOfCurrentPieceTasks = function () {
        this.eventBus.fire(new active_shape_ended_event_1.ActiveShapeEndedEvent(this.playerType, this.currentShape.getRow()));
        this.convertShapeToCells();
        if (this.handleFullBoard()) {
        }
        else {
            if (this.handleAnyFilledLinesPart1()) {
            }
            else {
                this.startShape(false);
            }
        }
    };
    /**
     * Used by the AI.
     */
    Board.prototype.getCurrentShapeColIdx = function () {
        return this.currentShape.getCol();
    };
    Board.prototype.moveShapeLeft = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveLeft();
            if (this.collisionDetected()) {
                this.currentShape.moveRight();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeRight = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveRight();
            if (this.collisionDetected()) {
                this.currentShape.moveLeft();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeDown = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.moveDown();
            if (this.collisionDetected()) {
                this.currentShape.moveUp();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.moveShapeDownAllTheWay = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            do {
                this.currentShape.moveDown();
            } while (!this.collisionDetected()); // TODO: Add upper bound.
            this.currentShape.moveUp();
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        else {
            success = false;
        }
        return success;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.moveToTop = function () {
        this.currentShape.moveToTop();
    };
    Board.prototype.rotateShapeClockwise = function () {
        var success;
        if (this.boardState === 1 /* InPlay */) {
            this.currentShape.rotateClockwise();
            if (this.jiggleRotatedShapeAround() === false) {
                this.currentShape.rotateCounterClockwise();
                success = false;
            }
            else {
                this.fireActiveShapeChangedEvent();
                success = true;
            }
        }
        else {
            success = false;
        }
        return success;
    };
    Board.prototype.generateRandomWhiteCells = function () {
        for (var count = 0; count < 10; count++) {
            var rowIdx = Math.floor(Math.random() * MAX_ROWS);
            var colIdx = Math.floor(Math.random() * MAX_COLS);
            this.changeCellColor(rowIdx, colIdx, 8 /* White */);
        }
    };
    /**
     * Return true if a cell was found and cleared.
     * Return false if none was found.
     */
    Board.prototype.clearOneWhiteCell = function () {
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                if (row[colIdx].getColor() === 8 /* White */) {
                    this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
                    return true;
                }
            }
        }
        return false;
    };
    Board.prototype.displayWin = function () {
        this.boardState = 2 /* Win */;
    };
    Board.prototype.displayLose = function () {
        this.boardState = 3 /* Lose */;
    };
    Board.prototype.handleEnded = function (elapsed) {
        this.endedStepElapsed += elapsed;
        if (this.endedStepElapsed > 250 && this.endedOffset > 0) {
            this.endedStepElapsed = 0;
            this.endedOffset -= 1;
            this.clear();
            for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
                var relativeRowIdx = rowIdx + this.endedOffset;
                if (relativeRowIdx > MAX_ROWS - 1) {
                    continue;
                }
                var row = this.matrix[rowIdx];
                for (var colIdx = 0; colIdx < row.length; colIdx++) {
                    if (win_1.win.hasCell(rowIdx, colIdx)) {
                        this.changeCellColor(relativeRowIdx, colIdx, 8 /* White */);
                    }
                }
            }
        }
    };
    /**
     * Returns true if able to successfully rotate the shape alongside anything, if any.
     */
    Board.prototype.jiggleRotatedShapeAround = function () {
        var _this = this;
        var success = false;
        var originalRow = this.currentShape.getRow();
        var originalCol = this.currentShape.getCol();
        if (this.collisionDetected() === false) {
            success = true; // Didn't need to do any jiggling at all.
        }
        else {
            // Jiggle it left.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveLeft();
                });
            }
            // If still unsuccessful, jiggle it right.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveRight();
                });
            }
            ;
            // If still unsuccessful, move it up, up to 4 times.
            if (success !== true) {
                success = this.doUpToThreeTimes(originalRow, originalCol, function () {
                    _this.currentShape.moveUp();
                });
            }
        }
        return success;
    };
    /**
     * Used by jiggleRotatedShapeAround().
     *
     * Sets the current shape to the given original coordinates.
     * Then, runs the given lambda a few times to see if any produce a non-collision state.
     */
    Board.prototype.doUpToThreeTimes = function (originalRow, originalCol, thing) {
        this.currentShape.setRow(originalRow);
        this.currentShape.setCol(originalCol);
        var success = false;
        for (var count = 0; count < 3; count++) {
            thing();
            if (this.collisionDetected() === false) {
                success = true;
                break;
            }
        }
        return success;
    };
    Board.prototype.addJunkRows = function (numberOfRowsToAdd) {
        // Clear rows at the top to make room at the bottom.
        this.matrix.splice(0, numberOfRowsToAdd);
        // Add junk rows at the bottom.
        for (var idx = 0; idx < numberOfRowsToAdd; idx++) {
            // Set the row to completely filled.
            var color = this.getNextJunkRowColor();
            var row = [];
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                var cell_2 = new cell_1.Cell();
                cell_2.setColor(color);
                row.push(cell_2);
            }
            // Punch a hole in the line.
            var cell = row[this.junkRowHoleColumn];
            cell.setColor(0 /* Empty */);
            // Prepare for the next junk row line.
            this.junkRowHoleColumn += this.junkRowHoleDirection;
            if (this.junkRowHoleColumn < 0) {
                this.junkRowHoleColumn = 1;
                this.junkRowHoleDirection *= -1; // Flips the direction
            }
            else if (this.junkRowHoleColumn >= MAX_COLS) {
                this.junkRowHoleColumn = MAX_COLS - 2;
                this.junkRowHoleDirection *= -1; // Flips the direction
            }
            this.matrix.push(row);
        }
        // Notify for all cells because entire board has changed.
        // TODO: Move to own method?
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
        // Prevent active shape from getting buried in as many as 4 rows.
        for (var count = 0; count < 4; count++) {
            if (this.currentShape.getRow() > 0 && this.collisionDetected() === true) {
                this.currentShape.moveUp();
                this.fireActiveShapeChangedEvent();
            }
        }
    };
    /**
     * Very hacky method just so the AI has a temp copy of the board to experiment with.
     */
    Board.prototype.cloneZombie = function () {
        var copy = new Board(this.playerType, shape_factory_1.deadShapeFactory, event_bus_1.deadEventBus);
        // Allow the AI to move and rotate the current shape
        copy.boardState = 1 /* InPlay */;
        // Copy the current shape and the matrix. Shouldn't need anything else.
        copy.currentShape = this.currentShape.cloneSimple();
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                copy.matrix[rowIdx][colIdx].setColor(row[colIdx].getColor());
            }
        }
        return copy;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateAggregateHeight = function () {
        var colHeights = this.calculateColumnHeights();
        return colHeights.reduce(function (a, b) { return a + b; });
    };
    /**
     * Used by the FallingSequencer.
     */
    Board.prototype.calculateHighestColumn = function () {
        var colHeights = this.calculateColumnHeights();
        return colHeights.reduce(function (a, b) { return a > b ? a : b; });
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateCompleteLines = function () {
        var completeLines = 0;
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            var count = 0;
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                if (row[colIdx].getColor() !== 0 /* Empty */) {
                    count++;
                }
            }
            if (count >= row.length) {
                completeLines++;
            }
        }
        return completeLines;
    };
    /**
     * Used by the AI.
     * Determines holes by scanning each column, highest floor to lowest floor, and
     * seeing how many times it switches from colored to empty (but not the other way around).
     */
    Board.prototype.calculateHoles = function () {
        var totalHoles = 0;
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            var holes = 0;
            var previousCellWasEmpty = true;
            for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                if (previousCellWasEmpty === false) {
                    if (cell.getColor() === 0 /* Empty */) {
                        holes++;
                        previousCellWasEmpty = true;
                    }
                    else {
                        previousCellWasEmpty = false;
                    }
                }
                else {
                    if (cell.getColor() === 0 /* Empty */) {
                        previousCellWasEmpty = true;
                    }
                    else {
                        previousCellWasEmpty = false;
                    }
                }
            }
            totalHoles += holes;
        }
        return totalHoles;
    };
    /**
     * Used by the AI.
     */
    Board.prototype.calculateBumpiness = function () {
        var bumpiness = 0;
        var colHeights = this.calculateColumnHeights();
        for (var idx = 0; idx < colHeights.length - 2; idx++) {
            var val1 = colHeights[idx];
            var val2 = colHeights[idx + 1];
            bumpiness += Math.abs(val1 - val2);
        }
        return bumpiness;
    };
    Board.prototype.calculateColumnHeights = function () {
        var colHeights = [];
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            colHeights.push(0);
        }
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            var highest = 0;
            for (var rowIdx = MAX_ROWS - 1; rowIdx >= 0; rowIdx--) {
                var cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== 0 /* Empty */) {
                    highest = MAX_ROWS - rowIdx;
                }
            }
            colHeights[colIdx] = highest;
        }
        return colHeights;
    };
    /**
     * The only reason this is not private is so the AI can experiment with it.
     * Work here should able to be be undone by undoConvertShapeToCells.
     */
    Board.prototype.convertShapeToCells = function () {
        for (var _i = 0, _a = this.currentShape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var rowIdx = offset.y + this.currentShape.getRow();
            var colIdx = offset.x + this.currentShape.getCol();
            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }
            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }
            this.changeCellColor(rowIdx, colIdx, this.currentShape.color);
        }
    };
    /**
     * Used by the AI. Should undo convertShapeToCells().
     */
    Board.prototype.undoConvertShapeToCells = function () {
        for (var _i = 0, _a = this.currentShape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var rowIdx = offset.y + this.currentShape.getRow();
            var colIdx = offset.x + this.currentShape.getCol();
            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }
            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }
            this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
        }
    };
    Board.prototype.clear = function () {
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
            }
        }
        _a = this.getRandomColors(), this.junkRowColor1 = _a[0], this.junkRowColor2 = _a[1];
        var _a;
    };
    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    Board.prototype.changeCellColor = function (rowIdx, colIdx, color) {
        // TODO: Maybe bounds check here.
        var cell = this.matrix[rowIdx][colIdx];
        cell.setColor(color);
        this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
    };
    Board.prototype.startShape = function (forceBagRefill) {
        this.currentShape = this.shapeFactory.nextShape(forceBagRefill);
        this.fireActiveShapeChangedEvent(true);
    };
    Board.prototype.tryGravity = function () {
        var canMoveDown = true;
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            canMoveDown = false;
        }
        this.currentShape.moveUp();
        return canMoveDown;
    };
    /**
     * Intended for checking of the current position of the current
     * shape has any overlap with existing cells that have color.
     */
    Board.prototype.collisionDetected = function () {
        var collision = false;
        for (var _i = 0, _a = this.currentShape.getOffsets(); _i < _a.length; _i++) {
            var offset = _a[_i];
            var row = offset.y + this.currentShape.getRow();
            var col = offset.x + this.currentShape.getCol();
            if (row < 0 || row >= this.matrix.length) {
                collision = true;
                break;
            }
            if (col < 0 || col >= this.matrix[row].length) {
                collision = true;
                break;
            }
            if (this.matrix[row][col].getColor() !== 0 /* Empty */) {
                collision = true;
                break;
            }
        }
        return collision;
    };
    Board.prototype.handleFullBoard = function () {
        var full = this.isBoardFull();
        if (full) {
            this.boardState = 0 /* Paused */; // Standby until sequence is finished.
            this.eventBus.fire(new board_filled_event_1.BoardFilledEvent(this.playerType));
            full = true;
        }
        return full;
    };
    /**
     * It is considered full if the two obscured rows at the top have colored cells in them.
     */
    Board.prototype.isBoardFull = function () {
        for (var rowIdx = 0; rowIdx < 2; rowIdx++) {
            for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== 0 /* Empty */) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Handle filled lines method 1 of 2, before animation.
     */
    Board.prototype.handleAnyFilledLinesPart1 = function () {
        var filledRowIdxs = this.determineFilledRowIdxs();
        if (filledRowIdxs.length > 0) {
            this.eventBus.fire(new rows_filled_event_1.RowsFilledEvent(filledRowIdxs, this.playerType));
            this.boardState = 0 /* Paused */; // Standby until animation is finished.
        }
        else {
        }
        return filledRowIdxs.length > 0;
    };
    /**
     * Handle filled lines method 2 of 2, after animation.
     * This is public so that the Model can call it.
     */
    Board.prototype.handleAnyFilledLinesPart2 = function () {
        // Have to check this again because there is a slight chance that rows shifted during the animation.
        var filledRowIdxs = this.determineFilledRowIdxs();
        // Remove the filled rows.
        // I think this only works because determineFilledRowIdxs() returns an array sorted ascending from 0.
        // If it wasn't sorted then it could end up skipping rows.
        for (var _i = 0, filledRowIdxs_1 = filledRowIdxs; _i < filledRowIdxs_1.length; _i++) {
            var filledRowIdx = filledRowIdxs_1[_i];
            this.removeAndCollapse(filledRowIdx);
        }
        // Have to send cell change notifications because removeAndCollapse() does not.
        this.notifyAllCells();
        // Animation was finished and board was updated, so resume play.
        this.boardState = 1 /* InPlay */;
        this.startShape(false);
    };
    /**
     * Removes only the bottom row.
     */
    Board.prototype.removeBottomLine = function () {
        this.removeAndCollapse(MAX_ROWS - 1);
        // Have to send cell change notifications because removeAndCollapse() does not.
        this.notifyAllCells();
    };
    Board.prototype.notifyAllCells = function () {
        for (var rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            var row = this.matrix[rowIdx];
            for (var colIdx = 0; colIdx < row.length; colIdx++) {
                var cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new cell_change_event_1.CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
    };
    /**
     * Returns a list of numbers, ascending, that correspond to filled rows.
     */
    Board.prototype.determineFilledRowIdxs = function () {
        var filledRowIdxs = [];
        for (var rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            var row = this.matrix[rowIdx];
            var filled = true;
            for (var _i = 0, row_1 = row; _i < row_1.length; _i++) {
                var cell = row_1[_i];
                if (cell.getColor() === 0 /* Empty */) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                filledRowIdxs.push(rowIdx);
            }
        }
        return filledRowIdxs;
    };
    /**
     * This removes the old row and puts a new row in its place at position 0, which is the highest visually to the player.
     * Delegates cell notification to the calling method.
     */
    Board.prototype.removeAndCollapse = function (rowIdx) {
        this.matrix.splice(rowIdx, 1);
        this.matrix.splice(0, 0, []);
        for (var colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            this.matrix[0][colIdx] = new cell_1.Cell();
        }
    };
    Board.prototype.fireActiveShapeChangedEvent = function (starting) {
        if (starting === void 0) { starting = false; }
        this.eventBus.fire(new active_shape_changed_event_1.ActiveShapeChangedEvent(this.currentShape, this.playerType, starting));
    };
    Board.prototype.getNextJunkRowColor = function () {
        var color;
        if (this.junkRowColorIdx <= 0) {
            color = this.junkRowColor1;
            this.junkRowColorIdx = 1;
        }
        else if (this.junkRowColorIdx >= 1) {
            color = this.junkRowColor2;
            this.junkRowColorIdx = 0;
        }
        return color;
    };
    Board.prototype.getRandomColors = function () {
        // Select two colors that are not equal to each other.
        var rand1 = Math.floor(Math.random() * 7);
        var rand2 = Math.floor(Math.random() * 7);
        if (rand1 === rand2) {
            rand2++;
            if (rand2 > 6) {
                rand2 = 0;
            }
        }
        return [this.colorByNumber(rand1), this.colorByNumber(rand2)];
    };
    Board.prototype.colorByNumber = function (value) {
        var color;
        switch (value) {
            case 0:
                color = 1 /* Cyan */;
                break;
            case 1:
                color = 2 /* Yellow */;
                break;
            case 2:
                color = 3 /* Purple */;
                break;
            case 3:
                color = 4 /* Green */;
                break;
            case 4:
                color = 5 /* Red */;
                break;
            case 5:
                color = 6 /* Blue */;
                break;
            case 6:
                color = 7 /* Orange */;
                break;
            default:
                color = 8 /* White */; // Shouldn't get here
        }
        return color;
    };
    return Board;
}());
exports.Board = Board;
},{"../../domain/cell":5,"../../domain/constants":6,"../../event/active-shape-changed-event":8,"../../event/active-shape-ended-event":9,"../../event/board-filled-event":10,"../../event/cell-change-event":11,"../../event/event-bus":12,"../../event/rows-filled-event":23,"./shape-factory":30,"./win":32}],29:[function(require,module,exports){
"use strict";
var FALL_TIME_MS = 1750;
var FallGuide = (function () {
    function FallGuide() {
    }
    return FallGuide;
}());
var FallingSequencer = (function () {
    function FallingSequencer(board) {
        this.board = board;
        this.fallTween = null;
        this.fallGuide = new FallGuide();
    }
    FallingSequencer.prototype.resetAndPlay = function (callback) {
        var _this = this;
        this.fallGuide.lastHeight = this.fallGuide.tweenedHeight = this.board.calculateHighestColumn();
        this.fallGuide.elapsed = 0;
        this.fallTween = new TWEEN.Tween(this.fallGuide)
            .to({ tweenedHeight: 0 }, FALL_TIME_MS)
            .easing(TWEEN.Easing.Linear.None) // Surprisingly, linear is the one that looks most "right".
            .onComplete(function () {
            _this.fallTween = null;
            _this.board.resetAndPlay();
            callback();
        })
            .start(this.fallGuide.elapsed);
    };
    /**
     * Doing this in two parts because onComplete() can set the tween to null.
     */
    FallingSequencer.prototype.step = function (elapsed) {
        if (this.fallTween != null) {
            this.fallGuide.elapsed += elapsed;
            this.fallTween.update(this.fallGuide.elapsed);
        }
        if (this.fallTween != null) {
            var newHeight = Math.ceil(this.fallGuide.tweenedHeight);
            if (this.fallGuide.lastHeight > newHeight) {
                var diff = this.fallGuide.lastHeight - newHeight;
                for (var idx = 0; idx < diff; idx++) {
                    this.board.removeBottomLine();
                }
                this.fallGuide.lastHeight = newHeight;
            }
        }
    };
    return FallingSequencer;
}());
exports.FallingSequencer = FallingSequencer;
},{}],30:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var shape_1 = require('./shape');
var ShapeI = (function (_super) {
    __extends(ShapeI, _super);
    function ShapeI() {
        _super.apply(this, arguments);
        this.color = 1 /* Cyan */;
        this.valuesPerRow = 4;
        this.startingEligible = true;
        this.matrices = [
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
        ];
    }
    ShapeI.prototype.getInstance = function () {
        return new ShapeI();
    };
    return ShapeI;
}(shape_1.Shape));
var ShapeJ = (function (_super) {
    __extends(ShapeJ, _super);
    function ShapeJ() {
        _super.apply(this, arguments);
        this.color = 6 /* Blue */;
        this.valuesPerRow = 3;
        this.startingEligible = true;
        this.matrices = [
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
    ShapeJ.prototype.getInstance = function () {
        return new ShapeJ();
    };
    return ShapeJ;
}(shape_1.Shape));
var ShapeL = (function (_super) {
    __extends(ShapeL, _super);
    function ShapeL() {
        _super.apply(this, arguments);
        this.color = 7 /* Orange */;
        this.valuesPerRow = 3;
        this.startingEligible = true;
        this.matrices = [
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
        ];
    }
    ShapeL.prototype.getInstance = function () {
        return new ShapeL();
    };
    return ShapeL;
}(shape_1.Shape));
var ShapeO = (function (_super) {
    __extends(ShapeO, _super);
    function ShapeO() {
        _super.apply(this, arguments);
        this.color = 2 /* Yellow */;
        this.valuesPerRow = 4;
        this.startingEligible = false;
        this.matrices = [
            [
                0, 1, 1, 0,
                0, 1, 1, 0,
                0, 0, 0, 0
            ]
        ];
    }
    ShapeO.prototype.getInstance = function () {
        return new ShapeO();
    };
    return ShapeO;
}(shape_1.Shape));
var ShapeS = (function (_super) {
    __extends(ShapeS, _super);
    function ShapeS() {
        _super.apply(this, arguments);
        this.color = 4 /* Green */;
        this.valuesPerRow = 3;
        this.startingEligible = false;
        this.matrices = [
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
        ];
    }
    ShapeS.prototype.getInstance = function () {
        return new ShapeS();
    };
    return ShapeS;
}(shape_1.Shape));
var ShapeT = (function (_super) {
    __extends(ShapeT, _super);
    function ShapeT() {
        _super.apply(this, arguments);
        this.color = 3 /* Purple */;
        this.valuesPerRow = 3;
        this.startingEligible = true;
        this.matrices = [
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
        ];
    }
    ShapeT.prototype.getInstance = function () {
        return new ShapeT();
    };
    return ShapeT;
}(shape_1.Shape));
var ShapeZ = (function (_super) {
    __extends(ShapeZ, _super);
    function ShapeZ() {
        _super.apply(this, arguments);
        this.color = 5 /* Red */;
        this.valuesPerRow = 3;
        this.startingEligible = false;
        this.matrices = [
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
        ];
    }
    ShapeZ.prototype.getInstance = function () {
        return new ShapeZ();
    };
    return ShapeZ;
}(shape_1.Shape));
var ShapeFactory = (function () {
    function ShapeFactory() {
        this.refillBag(true);
    }
    ShapeFactory.prototype.nextShape = function (forceBagRefill) {
        if (this.bag.length <= 0 || forceBagRefill === true) {
            this.refillBag(forceBagRefill);
        }
        return this.bag.pop(); // Get from end of array.
    };
    ShapeFactory.prototype.refillBag = function (startingPieceAsFirst) {
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
            var idx = this.bag.length;
            // While there remain elements to shuffle...
            while (0 !== idx) {
                // Pick a remaining element...
                var rndIdx = Math.floor(Math.random() * idx);
                idx -= 1;
                // And swap it with the current element.
                var tempVal = this.bag[idx];
                this.bag[idx] = this.bag[rndIdx];
                this.bag[rndIdx] = tempVal;
            }
        }
        // Only certain shapes can be dropped onto what could be a blank or almost-blank grid.
        if (startingPieceAsFirst === true) {
            var lastIdx = this.bag.length - 1;
            if (this.bag[lastIdx].startingEligible === true) {
            }
            else {
                for (var idx = 0; idx < lastIdx; idx++) {
                    if (this.bag[idx].startingEligible === true) {
                        var tempVal = this.bag[lastIdx];
                        this.bag[lastIdx] = this.bag[idx];
                        this.bag[idx] = tempVal;
                        break;
                    }
                }
            }
        }
    };
    return ShapeFactory;
}());
exports.ShapeFactory = ShapeFactory;
exports.deadShapeFactory = new ShapeFactory(); // Used by AI.
},{"./shape":31}],31:[function(require,module,exports){
"use strict";
var cell_1 = require('../../domain/cell');
var SPAWN_COL = 3; // Left side of matrix should correspond to this.
var Shape = (function () {
    function Shape() {
        this.currentMatrixIndex = 0; // TODO: Ensure position 0 is the spawn position
        this.row = 0;
        this.col = SPAWN_COL;
        this.startingEligible = false;
    }
    Shape.prototype.moveLeft = function () {
        this.col--;
    };
    Shape.prototype.moveRight = function () {
        this.col++;
    };
    Shape.prototype.moveUp = function () {
        this.row--;
    };
    Shape.prototype.moveDown = function () {
        this.row++;
    };
    /**
     * Used by the AI.
     */
    Shape.prototype.moveToTop = function () {
        this.row = 0;
    };
    Shape.prototype.rotateCounterClockwise = function () {
        this.currentMatrixIndex -= 1;
        this.ensureArrayBounds();
    };
    Shape.prototype.rotateClockwise = function () {
        this.currentMatrixIndex += 1;
        this.ensureArrayBounds();
    };
    Shape.prototype.getRow = function () {
        return this.row;
    };
    Shape.prototype.setRow = function (row) {
        this.row = row;
    };
    Shape.prototype.getCol = function () {
        return this.col;
    };
    Shape.prototype.setCol = function (col) {
        this.col = col;
    };
    Shape.prototype.getRowCount = function () {
        return Math.ceil(this.getCurrentMatrix().length / this.valuesPerRow);
    };
    Shape.prototype.getOffsets = function () {
        var matrix = this.getCurrentMatrix();
        var offsets = [];
        for (var idx = 0; idx < matrix.length; idx++) {
            var value = matrix[idx];
            if (value === 1) {
                var x = idx % this.valuesPerRow;
                var y = Math.floor(idx / this.valuesPerRow);
                var offset = new cell_1.CellOffset(x, y);
                offsets.push(offset);
            }
        }
        return offsets;
    };
    /**
     * Hacky method used by the AI.
     * "Simple" as in doesn't matter what the current row/col/matrix is.
     */
    Shape.prototype.cloneSimple = function () {
        // Get an instance of the concrete class. Rest of values are irrelevant.
        return this.getInstance();
    };
    Shape.prototype.getCurrentMatrix = function () {
        return this.matrices[this.currentMatrixIndex];
    };
    Shape.prototype.ensureArrayBounds = function () {
        if (this.currentMatrixIndex < 0) {
            this.currentMatrixIndex = this.matrices.length - 1;
        }
        else if (this.currentMatrixIndex >= this.matrices.length) {
            this.currentMatrixIndex = 0;
        }
    };
    return Shape;
}());
exports.Shape = Shape;
},{"../../domain/cell":5}],32:[function(require,module,exports){
"use strict";
var cells = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'x', 'x', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'x', 'x', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', 'x', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
];
var Win = (function () {
    function Win() {
    }
    Win.prototype.hasCell = function (rowIdx, colIdx) {
        if (rowIdx < cells.length) {
            var row = cells[rowIdx];
            if (colIdx < row.length) {
                if (cells[rowIdx][colIdx] === 'x') {
                    return true;
                }
            }
        }
        return false;
    };
    return Win;
}());
exports.win = new Win();
},{}],33:[function(require,module,exports){
"use strict";
var npc_manager_1 = require('./npc/npc-manager');
var playing_activity_1 = require('./playing-activity');
var event_bus_1 = require('../event/event-bus');
var falling_sequencer_event_1 = require('../event/falling-sequencer-event');
var EndedActivity = (function () {
    function EndedActivity() {
    }
    EndedActivity.prototype.start = function () {
        this.endedStarted = false;
    };
    EndedActivity.prototype.step = function (elapsed) {
        var _this = this;
        npc_manager_1.npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.
        playing_activity_1.playingActivity.step(elapsed); // Ditto.
        if (this.endedStarted === false) {
            this.endedStarted = true;
            playing_activity_1.playingActivity.clearBoards();
            // Delay for 1 second (HP is blinking at this time)
            setTimeout(function () {
                _this.displayWinner();
            }, 1000);
        }
        return 4 /* Ended */;
    };
    EndedActivity.prototype.displayWinner = function () {
        var _this = this;
        playing_activity_1.playingActivity.displayEnding();
        event_bus_1.eventBus.fire(new falling_sequencer_event_1.FallingSequencerEvent(1 /* Ai */)); // Quick hack to clear the lights
        event_bus_1.eventBus.fire(new falling_sequencer_event_1.FallingSequencerEvent(0 /* Human */)); // Quick hack to clear the lights
        setTimeout(function () {
            _this.displayThanks();
        }, 2500);
    };
    EndedActivity.prototype.displayThanks = function () {
        var message = document.getElementById('message');
        message.textContent = 'THE END - Thanks for playing all the way through our GitHub Game Off 2016 entry.';
    };
    return EndedActivity;
}());
exports.endedActivity = new EndedActivity();
},{"../event/event-bus":12,"../event/falling-sequencer-event":13,"./npc/npc-manager":37,"./playing-activity":40}],34:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../event/event-bus');
var npc_manager_1 = require('./npc/npc-manager');
var playing_activity_1 = require('./playing-activity');
var hp_changed_event_1 = require('../event/hp-changed-event');
var constants_1 = require('../domain/constants');
var camera_wrapper_1 = require('../view/camera-wrapper');
/**
 * Wraps playing activity to be able to show the initial office lights.
 */
var IntroActivity = (function () {
    function IntroActivity() {
    }
    IntroActivity.prototype.start = function () {
        var _this = this;
        this.timeInIntro = 0;
        this.playerHasHitAKey = false;
        this.hpBarsFilledCount = 0;
        this.introIsComplete = false;
        event_bus_1.eventBus.register(event_bus_1.EventType.GameStateChangedType, function (event) {
            if (event.gameStateType === 2 /* Intro */) {
                _this.handleGameStateChangedEventIntro();
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.IntroKeyPressedEventType, function (event) {
            if (_this.playerHasHitAKey === false) {
                _this.playerHasHitAKey = true;
                _this.transitionIntroToPlaying();
            }
        });
    };
    IntroActivity.prototype.step = function (elapsed) {
        this.timeInIntro += elapsed;
        npc_manager_1.npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.
        if (this.introIsComplete) {
            return 3 /* Playing */;
        }
        else {
            return 2 /* Intro */;
        }
    };
    /**
     * Set up the board in a way that makes the building look like a normal building.
     */
    IntroActivity.prototype.handleGameStateChangedEventIntro = function () {
        playing_activity_1.playingActivity.generateRandomWhiteCells();
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(0, 0 /* Human */));
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(0, 1 /* Ai */));
    };
    IntroActivity.prototype.transitionIntroToPlaying = function () {
        var _this = this;
        camera_wrapper_1.cameraWrapper.panToPlayingFocus();
        this.removeWhiteCell(function () {
            _this.lightUpHpBars();
        });
    };
    IntroActivity.prototype.removeWhiteCell = function (callback) {
        var _this = this;
        var cellsLeft = playing_activity_1.playingActivity.clearWhiteCell();
        if (cellsLeft) {
            setTimeout(function () { return _this.removeWhiteCell(callback); }, 250);
        }
        else {
            callback();
        }
    };
    IntroActivity.prototype.lightUpHpBars = function () {
        var _this = this;
        this.hpBarsFilledCount += 1;
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(this.hpBarsFilledCount, 0 /* Human */));
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(this.hpBarsFilledCount, 1 /* Ai */));
        if (this.hpBarsFilledCount < constants_1.PANEL_COUNT_PER_FLOOR) {
            setTimeout(function () { return _this.lightUpHpBars(); }, 250);
        }
        else {
            this.introIsComplete = true;
        }
    };
    return IntroActivity;
}());
exports.introActivity = new IntroActivity();
},{"../domain/constants":6,"../event/event-bus":12,"../event/hp-changed-event":15,"../view/camera-wrapper":45,"./npc/npc-manager":37,"./playing-activity":40}],35:[function(require,module,exports){
"use strict";
var game_state_1 = require('../game-state');
var intro_activity_1 = require('./intro-activity');
var playing_activity_1 = require('./playing-activity');
var ended_activity_1 = require('./ended-activity');
var Model = (function () {
    function Model() {
    }
    Model.prototype.start = function () {
        intro_activity_1.introActivity.start();
        playing_activity_1.playingActivity.start();
        ended_activity_1.endedActivity.start();
    };
    /**
     * Delegate step() to activities.
     * Determine next state from activities.
     */
    Model.prototype.step = function (elapsed) {
        var oldState = game_state_1.gameState.getCurrent();
        var newState;
        switch (oldState) {
            case 2 /* Intro */:
                newState = intro_activity_1.introActivity.step(elapsed);
                break;
            case 3 /* Playing */:
                newState = playing_activity_1.playingActivity.step(elapsed);
                break;
            case 4 /* Ended */:
                newState = ended_activity_1.endedActivity.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }
        if (newState !== oldState) {
            game_state_1.gameState.setCurrent(newState);
        }
    };
    return Model;
}());
exports.model = new Model();
},{"../game-state":25,"./ended-activity":33,"./intro-activity":34,"./playing-activity":40}],36:[function(require,module,exports){
"use strict";
var game_state_1 = require('../../game-state');
var CrowdStats = (function () {
    function CrowdStats() {
        //
    }
    CrowdStats.prototype.start = function () {
        //
    };
    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    CrowdStats.prototype.giveInitialDirection = function (npc) {
        switch (game_state_1.gameState.getCurrent()) {
            case 3 /* Playing */:
                this.moveNpcOffScreen(npc);
                break;
            case 2 /* Intro */:
                this.introTeleportOntoWalkway(npc);
                break;
            case 4 /* Ended */:
                this.stayOffStage(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.moveNpcOffScreen = function (npc) {
        var offscreen = Math.floor(Math.random() * 2);
        if (offscreen == 0) {
            npc.teleportTo(1 /* OffLeft */);
            npc.addWaypoint(3 /* BuildingLeft */);
        }
        else {
            npc.teleportTo(2 /* OffRight */);
            npc.addWaypoint(4 /* BuildingRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoWalkway = function (npc) {
        var walkway = Math.floor(Math.random() * 3); // 3 = Total number of Building* locations
        switch (walkway) {
            case 0:
                this.introTeleportOntoBuildingLeft(npc);
                break;
            case 1:
                this.introTeleportOntoBuildingRight(npc);
                break;
            case 2:
                this.introTeleportOntoBuildingMiddle(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingLeft = function (npc) {
        npc.teleportTo(3 /* BuildingLeft */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingRight = function (npc) {
        npc.teleportTo(4 /* BuildingRight */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.introTeleportOntoBuildingMiddle = function (npc) {
        npc.teleportTo(4 /* BuildingRight */);
        var direction = Math.floor(Math.random() * 2);
        if (direction === 0) {
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    CrowdStats.prototype.giveDirection = function (npc) {
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                this.giveDirectionIntro(npc);
                break;
            case 3 /* Playing */:
                this.giveDirectionPlaying(npc);
                break;
            case 4 /* Ended */:
                this.giveDirectionEnded(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    /**
     * Have an offscreen NPC walk to the middle and them back offscreen.
     */
    CrowdStats.prototype.giveDirectionIntro = function (npc) {
        var side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(1 /* OffLeft */);
        }
        else {
            npc.addWaypoint(5 /* BuildingMiddle */);
            npc.addWaypoint(2 /* OffRight */);
        }
    };
    CrowdStats.prototype.giveDirectionPlaying = function (npc) {
        var action = Math.floor(Math.random() * 10);
        switch (action) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.giveDirectionPlayingStand(npc);
                break;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                this.giveDirectionPlayingMove(npc);
                break;
            default:
                console.log('should not get here');
        }
    };
    CrowdStats.prototype.giveDirectionPlayingStand = function (npc) {
        var side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.standFacing(1 /* BuildingRight */, 15000);
        }
        else {
            npc.standFacing(0 /* BuildingLeft */, 15000);
        }
    };
    CrowdStats.prototype.giveDirectionPlayingMove = function (npc) {
        var where = Math.floor(Math.random() * 26);
        switch (where) {
            case 0:
                npc.addWaypoint(1 /* OffLeft */);
                break;
            case 1:
                npc.addWaypoint(2 /* OffRight */);
                break;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                npc.addWaypoint(3 /* BuildingLeft */);
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                npc.addWaypoint(4 /* BuildingRight */);
                break;
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                npc.addWaypoint(5 /* BuildingMiddle */);
                break;
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                npc.addWaypoint(6 /* Middle */);
                break;
            default:
                console.log('should not get here');
        }
    };
    /**
     * Just don't go anywhere
     */
    CrowdStats.prototype.stayOffStage = function (npc) {
        npc.teleportTo(1 /* OffLeft */);
    };
    CrowdStats.prototype.giveDirectionEnded = function (npc) {
        if (npc.ended === false) {
            npc.ended = true;
            var offscreen = Math.floor(Math.random() * 2);
            if (offscreen == 0) {
                npc.addWaypoint(1 /* OffLeft */);
            }
            else {
                npc.addWaypoint(2 /* OffRight */);
            }
        }
        else {
            npc.standFacing(0 /* BuildingLeft */, 20000);
        }
    };
    return CrowdStats;
}());
exports.crowdStats = new CrowdStats();
},{"../../game-state":25}],37:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var game_state_1 = require('../../game-state');
var npc_1 = require('./npc');
var event_bus_1 = require('../../event/event-bus');
var release_timer_1 = require('./release-timer');
var crowd_stats_1 = require('./crowd-stats');
var NpcManager = (function () {
    function NpcManager() {
        this.npcs = new Map();
        this.npcsOffscreen = [];
        this.npcsInPlay = [];
    }
    NpcManager.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.StandeeMovementEndedEventType, function (event) {
            _this.handleStandeeMovementEndedEvent(event);
        });
        // TODO: Register listeners for game events, like board collapse or if a shape caused holes.
        var _loop_1 = function(npcIdx) {
            var npc = new npc_1.Npc(function () {
                crowd_stats_1.crowdStats.giveDirection(npc);
            });
            npc.start();
            this_1.npcs.set(npc.id, npc);
            this_1.npcsOffscreen.push(npc);
        };
        var this_1 = this;
        for (var npcIdx = 0; npcIdx < release_timer_1.TOTAL_NPCS; npcIdx++) {
            _loop_1(npcIdx);
        }
        release_timer_1.releaseTimer.start();
        crowd_stats_1.crowdStats.start();
    };
    NpcManager.prototype.step = function (elapsed) {
        var expectedInPlay = release_timer_1.releaseTimer.step(elapsed);
        if (game_state_1.gameState.getCurrent() === 2 /* Intro */ || game_state_1.gameState.getCurrent() === 3 /* Playing */) {
            this.ensureInPlayNpcCount(expectedInPlay);
        }
        this.npcsInPlay.forEach(function (npc) {
            npc.step(elapsed);
        });
    };
    NpcManager.prototype.ensureInPlayNpcCount = function (expectedInPlay) {
        if (this.npcsInPlay.length < expectedInPlay) {
            var diff = expectedInPlay - this.npcsInPlay.length;
            for (var count = 0; count < diff; count++) {
                this.sendAnOffscreenNpcIntoPlay();
            }
        }
    };
    NpcManager.prototype.sendAnOffscreenNpcIntoPlay = function () {
        var npc = this.npcsOffscreen.pop();
        if (npc != null) {
            this.npcsInPlay.push(npc);
            crowd_stats_1.crowdStats.giveInitialDirection(npc);
        }
    };
    NpcManager.prototype.handleStandeeMovementEndedEvent = function (event) {
        var npc = this.npcs.get(event.npcId);
        if (npc != null) {
            var x = event.x;
            var y = event.z;
            npc.updatePosition(x, y);
        }
    };
    return NpcManager;
}());
exports.npcManager = new NpcManager();
},{"../../event/event-bus":12,"../../game-state":25,"./crowd-stats":36,"./npc":38,"./release-timer":39}],38:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var npc_placed_event_1 = require('../../event/npc-placed-event');
var npc_movement_changed_event_1 = require('../../event/npc-movement-changed-event');
var npc_facing_event_1 = require('../../event/npc-facing-event');
var npc_teleported_event_1 = require('../../event/npc-teleported-event');
var Npc = (function () {
    function Npc(readyForCommandCallback) {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.ended = false;
        this.state = 1 /* WaitingForCommand */;
        this.standingTtl = 0;
        this.waypoints = [];
        this.xlast = 0;
        this.ylast = 0;
        this.readyForCommandCallback = readyForCommandCallback;
    }
    Npc.prototype.start = function () {
        // Place it out of view somewhere.
        this.xlast = -5;
        this.ylast = 15;
        event_bus_1.eventBus.fire(new npc_placed_event_1.NpcPlacedEvent(this.id, this.xlast, this.ylast));
    };
    Npc.prototype.step = function (elapsed) {
        switch (this.state) {
            case 0 /* Walking */:
                this.stepWalking();
                break;
            case 2 /* Standing */:
                this.stepStanding(elapsed);
                break;
            case 1 /* WaitingForCommand */:
                this.stepWaitingForCommand();
                break;
            default:
                console.log('should not get here');
        }
    };
    Npc.prototype.stepWalking = function () {
        // Maybe nothing here.
    };
    Npc.prototype.stepStanding = function (elapsed) {
        this.standingTtl -= elapsed;
        if (this.standingTtl <= 0) {
            this.state = 1 /* WaitingForCommand */;
        }
    };
    Npc.prototype.stepWaitingForCommand = function () {
        if (this.waypoints.length > 0) {
            var nextLocation = this.waypoints.shift();
            this.beginWalkingTo(nextLocation);
        }
        else {
            this.readyForCommandCallback();
        }
    };
    Npc.prototype.standFacing = function (focusPoint, standingTtl) {
        this.state = 2 /* Standing */;
        this.standingTtl = standingTtl;
        if (focusPoint === 0 /* BuildingLeft */) {
            event_bus_1.eventBus.fire(new npc_facing_event_1.NpcFacingEvent(this.id, 5, -3));
        }
        else if (focusPoint === 1 /* BuildingRight */) {
            event_bus_1.eventBus.fire(new npc_facing_event_1.NpcFacingEvent(this.id, 15.5, 5));
        }
    };
    Npc.prototype.addWaypoint = function (location) {
        this.waypoints.push(location);
    };
    /**
     * Signifies the end of a walk. Does not send an event.
     */
    Npc.prototype.updatePosition = function (x, y) {
        this.xlast = x;
        this.ylast = y;
        this.state = 1 /* WaitingForCommand */;
    };
    /**
     * Teleports the NPC to the given location.
     * Sends an event so the standee can be updated.
     */
    Npc.prototype.teleportTo = function (location) {
        var x, y;
        _a = this.generateRandomCoordinates(location), x = _a[0], y = _a[1];
        this.xlast = x;
        this.ylast = y;
        event_bus_1.eventBus.fire(new npc_teleported_event_1.NpcTeleportedEvent(this.id, x, y));
        var _a;
    };
    Npc.prototype.beginWalkingTo = function (location) {
        var x, y;
        _a = this.generateRandomCoordinates(location), x = _a[0], y = _a[1];
        this.state = 0 /* Walking */;
        event_bus_1.eventBus.fire(new npc_movement_changed_event_1.NpcMovementChangedEvent(this.id, x, y));
        var _a;
    };
    Npc.prototype.generateRandomCoordinates = function (location) {
        var x = 0;
        var y = 0;
        switch (location) {
            case 1 /* OffLeft */:
                _a = this.randomWithinRange(-5, 5, 2), x = _a[0], y = _a[1];
                break;
            case 2 /* OffRight */:
                _b = this.randomWithinRange(10, 15, 2), x = _b[0], y = _b[1];
                break;
            case 3 /* BuildingLeft */:
                _c = this.randomWithinRange(5, 4.5, 2), x = _c[0], y = _c[1];
                break;
            case 4 /* BuildingRight */:
                _d = this.randomWithinRange(9, 7.5, 2), x = _d[0], y = _d[1];
                break;
            case 5 /* BuildingMiddle */:
                _e = this.randomWithinRange(10, 2.5, 2), x = _e[0], y = _e[1];
                break;
            case 6 /* Middle */:
                _f = this.randomWithinRange(6, 10, 3), x = _f[0], y = _f[1];
                break;
            default:
                console.log('should not get here');
        }
        return [x, y];
        var _a, _b, _c, _d, _e, _f;
    };
    Npc.prototype.randomWithinRange = function (x, y, variance) {
        var xresult = x - (variance / 2) + (Math.random() * variance);
        var yresult = y - (variance / 2) + (Math.random() * variance);
        return [xresult, yresult];
    };
    return Npc;
}());
exports.Npc = Npc;
},{"../../event/event-bus":12,"../../event/npc-facing-event":17,"../../event/npc-movement-changed-event":18,"../../event/npc-placed-event":19,"../../event/npc-teleported-event":20}],39:[function(require,module,exports){
"use strict";
var game_state_1 = require('../../game-state');
var constants_1 = require('../../domain/constants');
// Starting position counts used in initialization.
exports.TOTAL_NPCS = 40;
var NPCS_PER_SECOND = constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN / exports.TOTAL_NPCS;
var TIME_TO_REACT_TO_LEAVE_MS = 5 * 1000;
var INTRO_STARTING_COUNT = 5;
var ReleaseTimer = (function () {
    function ReleaseTimer() {
        this.introTimeElapsed = 0;
        this.playTimeElapsed = 0;
        this.endTimeElapsed = 0;
    }
    ReleaseTimer.prototype.start = function () {
    };
    ReleaseTimer.prototype.step = function (elapsed) {
        var expectedInPlay = 0;
        switch (game_state_1.gameState.getCurrent()) {
            case 2 /* Intro */:
                expectedInPlay = this.stepIntro(elapsed);
                break;
            case 3 /* Playing */:
                expectedInPlay = this.stepPlaying(elapsed);
                break;
            case 4 /* Ended */:
                expectedInPlay = this.stepEnded(elapsed);
                break;
            default:
                console.log('should not get here');
        }
        return expectedInPlay;
    };
    ReleaseTimer.prototype.stepIntro = function (elapsed) {
        this.introTimeElapsed += elapsed;
        return INTRO_STARTING_COUNT;
    };
    ReleaseTimer.prototype.stepPlaying = function (elapsed) {
        this.playTimeElapsed += elapsed;
        var expectedInPlay = INTRO_STARTING_COUNT + Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
        if (expectedInPlay > exports.TOTAL_NPCS) {
            expectedInPlay = exports.TOTAL_NPCS;
        }
        return expectedInPlay;
    };
    ReleaseTimer.prototype.stepEnded = function (elapsed) {
        return 0; // Just don't add more
    };
    return ReleaseTimer;
}());
exports.releaseTimer = new ReleaseTimer();
},{"../../domain/constants":6,"../../game-state":25}],40:[function(require,module,exports){
"use strict";
var game_state_1 = require('../game-state');
var board_1 = require('./board/board');
var ai_1 = require('./ai/ai');
var npc_manager_1 = require('./npc/npc-manager');
var event_bus_1 = require('../event/event-bus');
var player_movement_1 = require('../domain/player-movement');
var hp_changed_event_1 = require('../event/hp-changed-event');
var shape_factory_1 = require('./board/shape-factory');
var falling_sequencer_1 = require('./board/falling-sequencer');
var falling_sequencer_event_1 = require('../event/falling-sequencer-event');
var vitals_1 = require('./vitals');
var PlayingActivity = (function () {
    function PlayingActivity() {
        var humanShapeFactory = new shape_factory_1.ShapeFactory();
        this.humanBoard = new board_1.Board(0 /* Human */, humanShapeFactory, event_bus_1.eventBus);
        this.humanFallingSequencer = new falling_sequencer_1.FallingSequencer(this.humanBoard);
        var aiShapeFactory = new shape_factory_1.ShapeFactory();
        this.aiBoard = new board_1.Board(1 /* Ai */, aiShapeFactory, event_bus_1.eventBus);
        this.aiFallingSequencer = new falling_sequencer_1.FallingSequencer(this.aiBoard);
        this.ai = new ai_1.Ai(this.aiBoard);
    }
    PlayingActivity.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.PlayerMovementEventType, function (event) {
            _this.handlePlayerMovement(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsFilledEventType, function (event) {
            _this.handleRowsFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsClearAnimationCompletedEventType, function (event) {
            _this.handleRowClearAnimationCompletedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.BoardFilledEventType, function (event) {
            _this.handleBoardFilledEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            _this.handleActiveShapeChangedEvent(event);
        });
        this.ai.start();
        npc_manager_1.npcManager.start();
        // TODO: Instead of here, start game when player hits a key first.
        this.humanBoard.resetAndPlay();
        this.aiBoard.resetAndPlay();
    };
    PlayingActivity.prototype.step = function (elapsed) {
        this.humanBoard.step(elapsed);
        this.humanFallingSequencer.step(elapsed);
        this.aiBoard.step(elapsed);
        this.aiFallingSequencer.step(elapsed);
        this.ai.step(elapsed);
        npc_manager_1.npcManager.step(elapsed);
        return 3 /* Playing */;
    };
    /**
     * Quick hack to get it done.
     */
    PlayingActivity.prototype.stepBoardsOnly = function (elapsed) {
        this.humanBoard.step(elapsed);
        this.aiBoard.step(elapsed);
    };
    /**
     * Called by IntroActivity.
     */
    PlayingActivity.prototype.generateRandomWhiteCells = function () {
        this.humanBoard.generateRandomWhiteCells();
        this.aiBoard.generateRandomWhiteCells();
    };
    /**
     * Called by IntroActivity.
     */
    PlayingActivity.prototype.clearWhiteCell = function () {
        var result1 = this.humanBoard.clearOneWhiteCell();
        var result2 = this.aiBoard.clearOneWhiteCell();
        return (result1 || result2);
    };
    PlayingActivity.prototype.clearBoards = function () {
        this.aiBoard.resetAndPlay(false);
        this.humanBoard.resetAndPlay(false);
    };
    PlayingActivity.prototype.displayEnding = function () {
        if (vitals_1.vitals.aiHitPoints <= 0) {
            this.aiBoard.displayLose();
            this.humanBoard.displayWin();
        }
        else if (vitals_1.vitals.humanHitPoints <= 0) {
            this.aiBoard.displayWin();
            this.humanBoard.displayLose();
        }
    };
    PlayingActivity.prototype.handlePlayerMovement = function (event) {
        var board = this.determineBoardFor(event.playerType);
        switch (event.movement) {
            case player_movement_1.PlayerMovement.Left:
                board.moveShapeLeft();
                break;
            case player_movement_1.PlayerMovement.Right:
                board.moveShapeRight();
                break;
            case player_movement_1.PlayerMovement.Down:
                board.moveShapeDown();
                break;
            case player_movement_1.PlayerMovement.Drop:
                if (board.moveShapeDownAllTheWay()) {
                    board.handleEndOfCurrentPieceTasks(); // Prevents any other keystrokes affecting the shape after it hits the bottom.
                }
                break;
            case player_movement_1.PlayerMovement.RotateClockwise:
                board.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    };
    /**
     * Transfer the filled rows to be junk rows on the opposite player's board.
     */
    PlayingActivity.prototype.handleRowsFilledEvent = function (event) {
        var board = this.determineBoardForOppositeOf(event.playerType);
        board.addJunkRows(event.filledRowIdxs.length);
    };
    PlayingActivity.prototype.handleRowClearAnimationCompletedEvent = function (event) {
        var board = this.determineBoardFor(event.playerType);
        board.handleAnyFilledLinesPart2();
    };
    /**
     * Returns the human's board if given the human's type, or AI's board if given the AI.
     */
    PlayingActivity.prototype.determineBoardFor = function (playerType) {
        if (playerType === 0 /* Human */) {
            return this.humanBoard;
        }
        else {
            return this.aiBoard;
        }
    };
    /**
     * If this method is given "Human", it will return the AI's board, and vice versa.
     */
    PlayingActivity.prototype.determineBoardForOppositeOf = function (playerType) {
        if (playerType === 0 /* Human */) {
            return this.aiBoard;
        }
        else {
            return this.humanBoard;
        }
    };
    PlayingActivity.prototype.handleBoardFilledEvent = function (event) {
        var _this = this;
        var board;
        var fallingSequencer;
        var hp;
        if (event.playerType === 0 /* Human */) {
            board = this.humanBoard;
            fallingSequencer = this.humanFallingSequencer;
            hp = (vitals_1.vitals.humanHitPoints -= 2);
        }
        else {
            board = this.aiBoard;
            fallingSequencer = this.aiFallingSequencer;
            hp = (vitals_1.vitals.aiHitPoints -= 2);
        }
        event_bus_1.eventBus.fire(new hp_changed_event_1.HpChangedEvent(hp, event.playerType, true));
        // TODO: See if one of the players has run out of HP, somewhere if not here.
        event_bus_1.eventBus.fire(new falling_sequencer_event_1.FallingSequencerEvent(event.playerType));
        fallingSequencer.resetAndPlay(function () {
            _this.checkForEndOfGame();
        });
    };
    PlayingActivity.prototype.handleActiveShapeChangedEvent = function (event) {
        if (event.starting === true && event.playerType === 1 /* Ai */) {
            this.ai.strategize();
        }
        else {
        }
    };
    PlayingActivity.prototype.checkForEndOfGame = function () {
        if (vitals_1.vitals.aiHitPoints <= 0 || vitals_1.vitals.humanHitPoints <= 0) {
            game_state_1.gameState.setCurrent(4 /* Ended */);
        }
    };
    return PlayingActivity;
}());
exports.playingActivity = new PlayingActivity();
},{"../domain/player-movement":7,"../event/event-bus":12,"../event/falling-sequencer-event":13,"../event/hp-changed-event":15,"../game-state":25,"./ai/ai":27,"./board/board":28,"./board/falling-sequencer":29,"./board/shape-factory":30,"./npc/npc-manager":37,"./vitals":41}],41:[function(require,module,exports){
"use strict";
var constants_1 = require('../domain/constants');
exports.MAX_HP = constants_1.PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.
var Vitals = (function () {
    function Vitals() {
        this.humanHitPoints = exports.MAX_HP;
        this.aiHitPoints = exports.MAX_HP;
    }
    return Vitals;
}());
exports.vitals = new Vitals();
},{"../domain/constants":6}],42:[function(require,module,exports){
"use strict";
var standee_animation_texture_base_1 = require('./view/standee/standee-animation-texture-base');
var building_preloader_1 = require('./view/lighting/building-preloader');
var ground_1 = require('./view/world/ground');
var sound_loader_1 = require('./sound/sound-loader');
var Preloader = (function () {
    function Preloader() {
        this.loadingDiv = document.getElementById('loading');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingError = document.getElementById('loading-error');
        this.loadingBar = document.getElementById('loading-bar');
    }
    Preloader.prototype.preload = function (signalPreloadingComplete) {
        var _this = this;
        var count = 0;
        var total = 0;
        var callWhenFinished = function (success) {
            if (success) {
                count++;
                _this.loadingMessage.textContent = 'Loaded ' + count + ' of ' + total + ' fixtures...';
                if (count >= total) {
                    _this.fadeOut();
                    signalPreloadingComplete();
                    _this.deferredLoad();
                }
                _this.loadingBar.setAttribute('value', String(count));
            }
            else {
                _this.loadingError.textContent = 'Error loading fixtures. Please reload if you would like to retry.';
            }
        };
        total += standee_animation_texture_base_1.standeeAnimationTextureBase.preload(function (success) {
            callWhenFinished(success);
        });
        total += building_preloader_1.buildingPreloader.preload(function (success) {
            callWhenFinished(success);
        });
        total += ground_1.ground.preload(function (success) {
            callWhenFinished(success);
        });
        total += sound_loader_1.soundLoader.preload(function (success) {
            callWhenFinished(success);
        });
        this.loadingBar.setAttribute('max', String(total));
    };
    Preloader.prototype.fadeOut = function () {
        var _this = this;
        this.loadingDiv.style.opacity = '0';
        this.loadingDiv.style.transition = 'opacity 1s';
        setTimeout(function () {
            _this.loadingDiv.style.display = 'none';
        }, 1250); // Just a little bit longer than transition time.
    };
    /**
     * Load more fixtures that will not be needed immediately.
     */
    Preloader.prototype.deferredLoad = function () {
        sound_loader_1.soundLoader.deferredLoad();
    };
    return Preloader;
}());
exports.preloader = new Preloader();
},{"./sound/sound-loader":43,"./view/lighting/building-preloader":46,"./view/standee/standee-animation-texture-base":52,"./view/world/ground":57}],43:[function(require,module,exports){
"use strict";
var sound_manager_1 = require('./sound-manager');
var constants_1 = require('../domain/constants');
// 1) Ambience - Night
// 2) Music - Opening
var FILES_TO_PRELOAD = 2;
var SoundLoader = (function () {
    function SoundLoader() {
    }
    SoundLoader.prototype.preload = function (signalOneFileLoaded) {
        {
            var ambienceNightHowl_1 = new Howl({
                src: ['ambience-night.m4a'],
                volume: 0.33
            });
            ambienceNightHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.AMBIENCE_NIGHT, ambienceNightHowl_1);
                signalOneFileLoaded(true);
            });
            ambienceNightHowl_1.once('loaderror', function () {
                signalOneFileLoaded(false);
            });
        }
        {
            var musicOpeningHowl_1 = new Howl({
                src: ['music-opening.m4a'],
                volume: 0.5
            });
            musicOpeningHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_OPENING, musicOpeningHowl_1);
                signalOneFileLoaded(true);
            });
            musicOpeningHowl_1.once('loaderror', function () {
                signalOneFileLoaded(false);
            });
        }
        return FILES_TO_PRELOAD;
    };
    SoundLoader.prototype.deferredLoad = function () {
        {
            var musicMainHowl_1 = new Howl({
                src: ['music-main.m4a'],
                volume: 0.7
            });
            musicMainHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_MAIN, musicMainHowl_1);
            });
        }
        {
            var musicMainVoxHowl_1 = new Howl({
                src: ['music-main-vox.m4a'],
                volume: 0.7
            });
            musicMainVoxHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.MUSIC_MAIN_VOX, musicMainVoxHowl_1);
            });
        }
        {
            var studentsTalkingHowl_1 = new Howl({
                src: ['students-talking.m4a'],
                volume: 0.0
            });
            studentsTalkingHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.STUDENTS_TALKING, studentsTalkingHowl_1);
            });
        }
        {
            var cheeringHowl_1 = new Howl({
                src: ['cheering.m4a'],
                volume: 0.0
            });
            cheeringHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.CHEERING, cheeringHowl_1);
            });
        }
        {
            var clappingHowl_1 = new Howl({
                src: ['clapping.m4a'],
                volume: 0.0
            });
            clappingHowl_1.once('load', function () {
                sound_manager_1.soundManager.cacheHowl(constants_1.CLAPPING, clappingHowl_1);
            });
        }
    };
    return SoundLoader;
}());
exports.soundLoader = new SoundLoader();
},{"../domain/constants":6,"./sound-manager":44}],44:[function(require,module,exports){
/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var event_bus_1 = require('../event/event-bus');
var game_state_1 = require('../game-state');
var constants_1 = require('../domain/constants');
var SOUND_KEY = '129083190-falling-sound';
var MUSIC_FADE_OUT_TIME_MS = 15 * 1000;
var SoundManager = (function () {
    function SoundManager() {
        var _this = this;
        this.soundToggleSection = document.getElementById('sound-toggle-section');
        this.soundToggleElement = document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = function () {
            _this.updateSoundSetting(!_this.soundToggleElement.checked);
        };
        this.howls = new Map();
        this.crowdNoiseElapsed = 0;
        this.crowdVolume = 0;
        this.musicEndingTtl = MUSIC_FADE_OUT_TIME_MS;
        this.musicVolume = 0;
    }
    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    SoundManager.prototype.attach = function () {
        this.updateSoundSetting();
    };
    SoundManager.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.GameStateChangedType, function (event) {
            switch (event.gameStateType) {
                case 2 /* Intro */:
                    _this.cueIntroSounds();
                    break;
                case 3 /* Playing */:
                    _this.cuePlayingSounds();
                    break;
                case 4 /* Ended */:
                    _this.fadeOutSounds();
                    break;
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.BoardFilledEventType, function (event) {
            if (game_state_1.gameState.getCurrent() === 3 /* Playing */) {
                _this.playBoardFilledReaction(event.playerType);
            }
        });
    };
    SoundManager.prototype.step = function (elapsed) {
        if (game_state_1.gameState.getCurrent() === 3 /* Playing */) {
            // Increase the crowd volume based on how long it has been playing, up to a little less than halfway.
            var studentsTalkingHowl = this.howls.get(constants_1.STUDENTS_TALKING);
            if (studentsTalkingHowl != null) {
                if (studentsTalkingHowl.playing()) {
                    this.crowdNoiseElapsed += elapsed;
                    this.crowdVolume = (this.crowdNoiseElapsed / (constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN / 2)) * 0.4;
                    if (this.crowdVolume > 0.4) {
                        this.crowdVolume = 0.4;
                    }
                    studentsTalkingHowl.volume(this.crowdVolume); // Seems... ok... to call this repeatedly...
                }
            }
            // Main music volume is constant
            this.musicVolume = 0.7;
        }
        else if (game_state_1.gameState.getCurrent() === 4 /* Ended */) {
            this.musicEndingTtl -= elapsed;
            if (this.musicEndingTtl < 0) {
                this.musicEndingTtl = 0;
            }
            this.musicVolume = (this.musicEndingTtl / MUSIC_FADE_OUT_TIME_MS) * 0.7; // 0.7 is from constant seen above
            var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
            if (musicMainHowl != null) {
                musicMainHowl.volume(this.musicVolume);
            }
            var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
            if (musicMainHowlVox != null) {
                musicMainHowlVox.volume(this.musicVolume);
            }
        }
    };
    SoundManager.prototype.cacheHowl = function (key, value) {
        this.howls.set(key, value);
    };
    /**
     * Part 2 is done off the main execution path, in case the user has client-side storage turned off.
     */
    SoundManager.prototype.updateSoundSetting = function (mute) {
        var _this = this;
        // Part 1: Update Howler
        if (mute == null) {
            // Default to sound on, in case the second part fails.
            this.soundToggleElement.checked = true;
        }
        else {
            var soundValue = void 0;
            if (mute) {
                soundValue = 'off';
            }
            else {
                soundValue = 'on';
            }
            Howler.mute(mute);
        }
        // Part 2: Update session storage
        setTimeout(function () {
            _this.soundToggleElement.removeAttribute('disabled');
            if (mute == null) {
                var soundValue = sessionStorage.getItem(SOUND_KEY);
                if (soundValue === 'off') {
                    _this.soundToggleElement.checked = false;
                    Howler.mute(true);
                }
            }
            else {
                var soundValue = void 0;
                if (mute) {
                    soundValue = 'off';
                }
                else {
                    soundValue = 'on';
                }
                sessionStorage.setItem(SOUND_KEY, soundValue);
            }
        }, 0);
    };
    SoundManager.prototype.cueIntroSounds = function () {
        var ambienceNightHowl = this.howls.get(constants_1.AMBIENCE_NIGHT);
        ambienceNightHowl.loop(true);
        ambienceNightHowl.play();
        var musicOpeningHowl = this.howls.get(constants_1.MUSIC_OPENING);
        musicOpeningHowl.loop(true);
        musicOpeningHowl.play();
    };
    /**
     * Once loaded, have the main music play after the intro music completes its current loop.
     * Also have the students talking start to play.
     */
    SoundManager.prototype.cuePlayingSounds = function () {
        var _this = this;
        var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
        var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
        if (musicMainHowl != null && musicMainHowlVox != null) {
            var musicOpeningHowl_1 = this.howls.get(constants_1.MUSIC_OPENING);
            musicOpeningHowl_1.loop(false);
            musicOpeningHowl_1.once('end', function () {
                musicOpeningHowl_1.unload();
                _this.chainMusicMain();
                // Also start the students talking.
                _this.cueStudentsTalkingSounds();
            });
        }
        else {
            // Not loaded yet, try again in a second.
            setTimeout(function () { return _this.cuePlayingSounds(); }, 1000);
        }
    };
    /**
     * Start this at a zero volume and gradually increase to about half volume.
     */
    SoundManager.prototype.cueStudentsTalkingSounds = function () {
        var _this = this;
        var studentsTalkingHowl = this.howls.get(constants_1.STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            studentsTalkingHowl.loop(true);
            studentsTalkingHowl.play();
        }
        else {
            // Not loaded yet, try again in a second.
            setTimeout(function () { return _this.cueStudentsTalkingSounds(); }, 1000);
        }
    };
    SoundManager.prototype.chainMusicMain = function () {
        var _this = this;
        var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
        var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
        musicMainHowl.volume(this.musicVolume);
        musicMainHowl.play();
        musicMainHowl.once('end', function () { return _this.chainMusicMainVox(); });
    };
    SoundManager.prototype.chainMusicMainVox = function () {
        var _this = this;
        var musicMainHowl = this.howls.get(constants_1.MUSIC_MAIN);
        var musicMainHowlVox = this.howls.get(constants_1.MUSIC_MAIN_VOX);
        musicMainHowlVox.volume(this.musicVolume);
        musicMainHowlVox.play();
        musicMainHowlVox.once('end', function () { return _this.chainMusicMain(); });
    };
    SoundManager.prototype.playBoardFilledReaction = function (playerType) {
        // Note: Scaling volume here to number of NPCs in play.
        var maxVolume = 0.9;
        if (playerType === 1 /* Ai */) {
            // Cheering for AI's board falling.
            var cheeringHowl = this.howls.get(constants_1.CHEERING);
            if (cheeringHowl != null) {
                var volume = (this.crowdNoiseElapsed / (constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN / 2)) * maxVolume;
                if (volume > maxVolume) {
                    volume = maxVolume;
                }
                cheeringHowl.volume(volume);
                cheeringHowl.play();
            }
        }
        else {
            // Clapping for Human's board falling.
            var clappingHowl = this.howls.get(constants_1.CLAPPING);
            if (clappingHowl != null) {
                var volume = (this.crowdNoiseElapsed / (constants_1.TIME_UNTIL_EVERYONE_ON_SCREEN / 2)) * maxVolume;
                if (volume > maxVolume) {
                    volume = maxVolume;
                }
                clappingHowl.volume(volume);
                clappingHowl.play();
            }
        }
    };
    /**
     * Quick hack just to get it done.
     */
    SoundManager.prototype.fadeOutSounds = function () {
        var studentsTalkingHowl = this.howls.get(constants_1.STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            studentsTalkingHowl.fade(this.crowdVolume, 0.0, 30 * 1000);
        }
    };
    return SoundManager;
}());
exports.soundManager = new SoundManager();
},{"../domain/constants":6,"../event/event-bus":12,"../game-state":25}],45:[function(require,module,exports){
"use strict";
var ASPECT_RATIO = 16 / 9;
var PAN_TIME_MS = 5500;
var startingFocus = new THREE.Vector3(9, 7.5, 2);
var playingFocus = new THREE.Vector3(6, 6.5, 2);
var PanGuide = (function () {
    function PanGuide() {
        this.panFocus = new THREE.Vector3();
    }
    return PanGuide;
}());
var CameraWrapper = (function () {
    function CameraWrapper() {
        this.camera = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 1000);
        this.panTween = null;
        this.panGuide = new PanGuide();
    }
    CameraWrapper.prototype.start = function () {
        //
    };
    /**
     * Warning: onComplete() can set the tween to null.
     */
    CameraWrapper.prototype.step = function (elapsed) {
        if (this.panTween != null) {
            this.panGuide.elapsed += elapsed;
            this.panTween.update(this.panGuide.elapsed);
            this.camera.lookAt(this.panGuide.panFocus);
        }
    };
    CameraWrapper.prototype.updateRendererSize = function (renderer) {
        var windowAspectRatio = window.innerWidth / window.innerHeight;
        var width, height;
        if (windowAspectRatio > ASPECT_RATIO) {
            // Too wide; scale off of window height.
            width = Math.floor(window.innerHeight * ASPECT_RATIO);
            height = window.innerHeight;
        }
        else if (windowAspectRatio <= ASPECT_RATIO) {
            // Too narrow or just right; scale off of window width.
            width = window.innerWidth;
            height = Math.floor(window.innerWidth / ASPECT_RATIO);
        }
        renderer.setSize(width, height);
        // Should be no need to update aspect ratio because it should be constant.
        // this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };
    CameraWrapper.prototype.lookAtStartingFocus = function () {
        this.camera.lookAt(startingFocus);
    };
    CameraWrapper.prototype.panToPlayingFocus = function () {
        var _this = this;
        this.panGuide.panFocus.x = startingFocus.x;
        this.panGuide.panFocus.y = startingFocus.y;
        this.panGuide.panFocus.z = startingFocus.z;
        this.panGuide.elapsed = 0;
        this.panTween = new TWEEN.Tween(this.panGuide.panFocus)
            .to({ x: playingFocus.x, y: playingFocus.y, z: playingFocus.z }, PAN_TIME_MS)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onComplete(function () {
            _this.panTween = null;
            _this.camera.lookAt(playingFocus); // TODO: Might not be necessary.
        })
            .start(this.panGuide.elapsed);
    };
    return CameraWrapper;
}());
exports.cameraWrapper = new CameraWrapper();
},{}],46:[function(require,module,exports){
"use strict";
// mtl and obj = 2 files.
var FILES_TO_PRELOAD = 2;
var BuildingPreloader = (function () {
    function BuildingPreloader() {
        this.instances = [];
        this.instancesRequested = 0;
    }
    BuildingPreloader.prototype.preload = function (signalOneFileLoaded) {
        var _this = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', function (materials) {
            materials.preload();
            signalOneFileLoaded(true);
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', function (obj) {
                _this.instances.push(obj);
                signalOneFileLoaded(true);
            }, undefined, function () { signalOneFileLoaded(false); });
        }, undefined, function () { signalOneFileLoaded(false); });
        return FILES_TO_PRELOAD;
    };
    BuildingPreloader.prototype.getInstance = function () {
        var instance;
        if (this.instancesRequested === 0) {
            instance = this.instances[0];
        }
        else {
            instance = this.instances[0].clone();
            this.instances.push(instance);
        }
        this.instancesRequested++;
        return instance;
    };
    return BuildingPreloader;
}());
exports.buildingPreloader = new BuildingPreloader();
},{}],47:[function(require,module,exports){
"use strict";
var building_preloader_1 = require('./building-preloader');
var Building = (function () {
    function Building() {
        this.group = new THREE.Object3D();
    }
    Building.prototype.start = function () {
        var obj = building_preloader_1.buildingPreloader.getInstance();
        obj.scale.setScalar(0.25);
        obj.position.set(5, -0.01, 0);
        this.group.add(obj);
        // Quick hack to prevent building from being see-through.
        var geometry = new THREE.PlaneGeometry(9, 3);
        var material = new THREE.MeshLambertMaterial({ color: 0x343330 });
        var wall = new THREE.Mesh(geometry, material);
        wall.position.set(5, 1, -3.5);
        this.group.add(wall);
    };
    Building.prototype.step = function (elapsed) {
        //
    };
    return Building;
}());
exports.Building = Building;
},{"./building-preloader":46}],48:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var MAX_CURTAIN_COUNT = 4;
var CURTAIN_WIDTH = constants_1.PANEL_COUNT_PER_FLOOR;
var CURTAIN_MOVE_TIME = 750;
var CurtainVertexPosition = (function () {
    function CurtainVertexPosition() {
        this.x = 0;
        this.elapsed = 0;
    }
    return CurtainVertexPosition;
}());
/**
 * I might have some of these backwards...
 */
(function (CurtainDirection) {
    CurtainDirection[CurtainDirection["OpenLeftToRight"] = 0] = "OpenLeftToRight";
    CurtainDirection[CurtainDirection["OpenRightToLeft"] = 1] = "OpenRightToLeft";
    CurtainDirection[CurtainDirection["CloseLeftToRight"] = 2] = "CloseLeftToRight";
    CurtainDirection[CurtainDirection["CloseRightToLeft"] = 3] = "CloseRightToLeft";
})(exports.CurtainDirection || (exports.CurtainDirection = {}));
var CurtainDirection = exports.CurtainDirection;
/**
 * Some notes on vertices within each curtain mesh without modifications:
 * Vertices 1 and 3 should rest at x = -CURTAIN_WIDTH / 2 (house left)
 * Vertices 0 and 2 should rest at x =  CURTAIN_WIDTH / 2 (house right)
 *
 * Example statements:
 * console.log('vertices 1 and 3 x: ' + curtain.geometry.vertices[1].x, curtain.geometry.vertices[3].x);
 * console.log('vertices 0 and 2 x: ' + curtain.geometry.vertices[0].x, curtain.geometry.vertices[2].x);
 * console.log('---');
 */
var Curtain = (function () {
    function Curtain() {
        this.group = new THREE.Object3D();
        this.curtains = [];
        for (var idx = 0; idx < MAX_CURTAIN_COUNT; idx++) {
            var geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
            var material = new THREE.MeshPhongMaterial({ color: 0x070716 }); // Midnight Blue
            var curtain = new THREE.Mesh(geometry, material);
            this.curtains.push(curtain);
        }
        this.curtainVertexPosition = new CurtainVertexPosition();
        this.curtainTween = null;
    }
    Curtain.prototype.start = function () {
        for (var _i = 0, _a = this.curtains; _i < _a.length; _i++) {
            var curtain = _a[_i];
            this.group.add(curtain);
        }
        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);
        this.group.visible = false;
    };
    Curtain.prototype.step = function (elapsed) {
        if (this.curtainTween != null) {
            this.curtainVertexPosition.elapsed += elapsed;
            this.curtainTween.update(this.curtainVertexPosition.elapsed);
        }
    };
    Curtain.prototype.startAnimation = function (floorIdxs, direction, callback) {
        var _this = this;
        // Prevent multiple animations at the same time.
        if (this.curtainTween != null) {
            return;
        }
        this.dropCurtain(floorIdxs);
        var xend;
        if (direction === CurtainDirection.CloseLeftToRight || direction === CurtainDirection.OpenLeftToRight) {
            this.curtainVertexPosition.x = CURTAIN_WIDTH / 2;
            xend = -CURTAIN_WIDTH / 2;
        }
        else if (direction === CurtainDirection.CloseRightToLeft || direction === CurtainDirection.OpenRightToLeft) {
            this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
            xend = CURTAIN_WIDTH / 2;
        }
        this.curtainVertexPosition.elapsed = 0;
        this.curtainTween = new TWEEN.Tween(this.curtainVertexPosition)
            .to({ x: xend }, CURTAIN_MOVE_TIME)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(function () {
            // See note at top about why idx1 and idx2 are what they are.
            var idx1, idx2;
            if (direction === CurtainDirection.CloseRightToLeft || direction === CurtainDirection.OpenLeftToRight) {
                idx1 = 0;
                idx2 = 2;
            }
            else if (direction === CurtainDirection.CloseLeftToRight || direction === CurtainDirection.OpenRightToLeft) {
                idx1 = 1;
                idx2 = 3;
            }
            for (var _i = 0, _a = _this.curtains; _i < _a.length; _i++) {
                var curtain = _a[_i];
                curtain.geometry.vertices[idx1].x = _this.curtainVertexPosition.x;
                curtain.geometry.vertices[idx2].x = _this.curtainVertexPosition.x;
                curtain.geometry.verticesNeedUpdate = true;
            }
        })
            .onComplete(function () { _this.completeAnimation(callback); })
            .start(this.curtainVertexPosition.elapsed);
    };
    /**
     * Make the requested number of curtains visible.
     * Position them on the requested floors.
     */
    Curtain.prototype.dropCurtain = function (floorIdxs) {
        for (var _i = 0, _a = this.curtains; _i < _a.length; _i++) {
            var curtain = _a[_i];
            curtain.visible = false;
        }
        for (var idx = 0; idx < floorIdxs.length; idx++) {
            var floorIdx = floorIdxs[idx];
            var curtain = this.curtains[idx];
            curtain.position.set(0, floorIdx, 0);
            // See note at top about why these are where they are.
            curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[1].x = CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[3].x = CURTAIN_WIDTH / 2;
            curtain.geometry.verticesNeedUpdate = true;
            curtain.visible = true;
        }
        this.group.visible = true;
    };
    Curtain.prototype.completeAnimation = function (callback) {
        this.group.visible = false;
        this.curtainTween = null;
        if (callback) {
            callback();
        }
    };
    return Curtain;
}());
exports.Curtain = Curtain;
},{"../../domain/constants":6}],49:[function(require,module,exports){
"use strict";
var constants_1 = require('../../domain/constants');
var HpPanels = (function () {
    function HpPanels(hpOrientation) {
        this.group = new THREE.Object3D();
        this.panels = [];
        for (var idx = 0; idx < constants_1.PANEL_COUNT_PER_FLOOR; idx++) {
            var geometry = new THREE.PlaneGeometry(0.6, 0.6);
            var material = new THREE.MeshPhongMaterial();
            var panel = new THREE.Mesh(geometry, material);
            var x = void 0;
            if (hpOrientation === 0 /* DecreasesRightToLeft */) {
                x = idx;
            }
            else {
                x = constants_1.PANEL_COUNT_PER_FLOOR - idx - 1;
            }
            var y = 0;
            var z = 0;
            panel.position.set(x, y, z);
            panel.visible = false;
            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xeeee00);
            panel.material.emissiveIntensity = 0.5;
            this.panels.push(panel);
        }
    }
    HpPanels.prototype.start = function () {
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var panel = _a[_i];
            this.group.add(panel);
        }
        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);
        this.updateHp(constants_1.PANEL_COUNT_PER_FLOOR, false);
    };
    HpPanels.prototype.step = function (elapsed) {
        //
    };
    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     * "blinkLost" means to animate the loss of the HP panels directly above.
     */
    HpPanels.prototype.updateHp = function (hp, blinkLost) {
        if (hp > constants_1.PANEL_COUNT_PER_FLOOR) {
            hp = constants_1.PANEL_COUNT_PER_FLOOR;
        }
        for (var idx = 0; idx < this.panels.length; idx++) {
            var panel = this.panels[idx];
            if (idx < hp) {
                panel.visible = true;
            }
            else {
                panel.visible = false;
            }
        }
        // Blink the lost panels, if any, to give the player the impression that they lost something.
        if (blinkLost === true && hp >= 0 && hp < this.panels.length - 1) {
            var idx = hp; // As in the next index up from the current HP index, since array start at 0.
            var panel1_1 = this.panels[idx];
            var panel2_1 = this.panels[idx + 1];
            var count_1 = 0;
            var blinkHandle_1 = setInterval(function () {
                count_1++;
                if (count_1 > 15) {
                    panel1_1.visible = false;
                    panel2_1.visible = false;
                    clearInterval(blinkHandle_1);
                }
                else {
                    panel1_1.visible = !panel1_1.visible;
                    panel2_1.visible = !panel2_1.visible;
                }
            }, 200);
        }
        // TODO: Handle update to HP = full as different from HP < full.
    };
    return HpPanels;
}());
exports.HpPanels = HpPanels;
},{"../../domain/constants":6}],50:[function(require,module,exports){
"use strict";
var building_1 = require('./building');
var curtain_1 = require('./curtain');
var hp_panels_1 = require('./hp-panels');
var curtain_2 = require('./curtain');
var constants_1 = require('../../domain/constants');
// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
exports.FLOOR_COUNT = 17;
var ACTIVE_SHAPE_LIGHT_COUNT = 4;
var PANEL_SIZE = 0.7;
var EmissiveIntensity = (function () {
    function EmissiveIntensity() {
    }
    return EmissiveIntensity;
}());
var LightingGrid = (function () {
    function LightingGrid(hpOrientation, rowClearDirection) {
        this.group = new THREE.Object3D();
        this.panelGroup = new THREE.Object3D();
        this.building = new building_1.Building();
        this.rowClearDirection = rowClearDirection;
        this.rowClearCurtain = new curtain_1.Curtain();
        this.junkRowCurtain = new curtain_1.Curtain();
        this.hpPanels = new hp_panels_1.HpPanels(hpOrientation);
        this.panels = [];
        for (var floorIdx = 0; floorIdx < exports.FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (var panelIdx = 0; panelIdx < constants_1.PANEL_COUNT_PER_FLOOR; panelIdx++) {
                var geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE); // TODO: clone() ?
                var material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1.0 });
                var panel = new THREE.Mesh(geometry, material);
                panel.visible = false;
                var x = panelIdx;
                var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                var z = 0;
                panel.position.set(x, y, z);
                this.panels[floorIdx][panelIdx] = panel;
            }
        }
        this.shapeLights = [];
        for (var count = 0; count < ACTIVE_SHAPE_LIGHT_COUNT; count++) {
            var geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
            var material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1.0 });
            var shapeLight = new THREE.Mesh(geometry, material);
            this.shapeLights.push(shapeLight);
        }
        this.currentShapeLightIdx = 0;
        this.highlighter = new THREE.PointLight(0xff00ff, 3.5, 3);
        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }
    LightingGrid.prototype.start = function () {
        this.group.add(this.building.group);
        this.group.add(this.rowClearCurtain.group);
        this.group.add(this.junkRowCurtain.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);
        this.building.start();
        this.rowClearCurtain.start();
        this.junkRowCurtain.start();
        this.hpPanels.start();
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_1 = floor; _b < floor_1.length; _b++) {
                var panel = floor_1[_b];
                this.panelGroup.add(panel);
            }
        }
        for (var _c = 0, _d = this.shapeLights; _c < _d.length; _c++) {
            var shapeLight = _d[_c];
            this.panelGroup.add(shapeLight);
        }
        this.panelGroup.add(this.highlighter);
        // Transform to fit against building.
        this.panelGroup.position.set(1.85, 3.8, -1.55);
        this.panelGroup.scale.set(0.7, 1.0, 1);
        // Make cells appear to pulse.
        this.emissiveIntensity.value = 0.33;
        this.pulseTweenElapsed = 0;
        this.pulseTween = new TWEEN.Tween(this.emissiveIntensity)
            .to({ value: 1.0 }, 750)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start(this.pulseTweenElapsed);
    };
    LightingGrid.prototype.step = function (elapsed) {
        this.stepPulse(elapsed);
        this.rowClearCurtain.step(elapsed);
        this.junkRowCurtain.step(elapsed);
        this.hpPanels.step(elapsed);
    };
    LightingGrid.prototype.switchRoomOff = function (floorIdx, panelIdx) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = false;
    };
    LightingGrid.prototype.switchRoomOn = function (floorIdx, panelIdx, color) {
        var panel = this.panels[floorIdx][panelIdx];
        panel.visible = true;
        panel.material.color.setHex(color);
        panel.material.emissive.setHex(color);
    };
    LightingGrid.prototype.sendActiveShapeLightTo = function (floorIdx, panelIdx, color) {
        var shapeLight = this.getNextShapeLight();
        shapeLight.material.color.setHex(color);
        shapeLight.material.emissive.setHex(color);
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= exports.FLOOR_COUNT) {
            shapeLight.visible = false;
        }
        else {
            shapeLight.visible = true;
        }
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0;
        shapeLight.position.set(x, y, z);
    };
    LightingGrid.prototype.getActiveShapeLightPosition = function () {
        return this.highlighter.position;
    };
    LightingGrid.prototype.sendHighlighterTo = function (floorIdx, panelIdx, color) {
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= exports.FLOOR_COUNT) {
            this.highlighter.visible = false;
        }
        else {
            this.highlighter.visible = true;
            this.highlighter.color.setHex(color);
        }
        var x = panelIdx;
        var y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        var z = 0;
        this.highlighter.position.set(x, y, z);
    };
    LightingGrid.prototype.updateHp = function (hp, blinkLost) {
        this.hpPanels.updateHp(hp, blinkLost);
    };
    LightingGrid.prototype.startRowClearingAnimation = function (floorIdxs, callback) {
        var curtainDirection;
        if (this.rowClearDirection === 0 /* LeftToRight */) {
            curtainDirection = curtain_2.CurtainDirection.OpenLeftToRight;
        }
        else {
            curtainDirection = curtain_2.CurtainDirection.OpenRightToLeft;
        }
        this.rowClearCurtain.startAnimation(floorIdxs, curtainDirection, callback);
    };
    LightingGrid.prototype.startJunkRowCurtainAnimation = function (floorCount) {
        if (floorCount > 4) {
            floorCount = 4;
        }
        else if (floorCount < 0) {
            floorCount = 0;
        }
        var floorIdxs = [0, 1, 2, 3].slice(0, floorCount);
        var curtainDirection;
        if (this.rowClearDirection === 0 /* LeftToRight */) {
            curtainDirection = curtain_2.CurtainDirection.CloseRightToLeft;
        }
        else {
            curtainDirection = curtain_2.CurtainDirection.CloseLeftToRight;
        }
        this.junkRowCurtain.startAnimation(floorIdxs, curtainDirection);
    };
    LightingGrid.prototype.hideShapeLightsAndHighlighter = function () {
        for (var _i = 0, _a = this.shapeLights; _i < _a.length; _i++) {
            var shapeLight = _a[_i];
            shapeLight.visible = false;
        }
        this.highlighter.visible = false;
    };
    LightingGrid.prototype.getNextShapeLight = function () {
        var shapeLight = this.shapeLights[this.currentShapeLightIdx];
        this.currentShapeLightIdx++;
        if (this.currentShapeLightIdx >= ACTIVE_SHAPE_LIGHT_COUNT) {
            this.currentShapeLightIdx = 0;
        }
        return shapeLight;
    };
    LightingGrid.prototype.stepPulse = function (elapsed) {
        if (this.pulseTween != null) {
            this.pulseTweenElapsed += elapsed;
            this.pulseTween.update(this.pulseTweenElapsed);
        }
        for (var _i = 0, _a = this.panels; _i < _a.length; _i++) {
            var floor = _a[_i];
            for (var _b = 0, floor_2 = floor; _b < floor_2.length; _b++) {
                var panel = floor_2[_b];
                panel.material.emissiveIntensity = this.emissiveIntensity.value;
            }
        }
    };
    return LightingGrid;
}());
exports.LightingGrid = LightingGrid;
},{"../../domain/constants":6,"./building":47,"./curtain":48,"./hp-panels":49}],51:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var rows_clear_animation_completed_event_1 = require('../../event/rows-clear-animation-completed-event');
var lighting_grid_1 = require('./lighting-grid');
var Switchboard = (function () {
    function Switchboard(lightingGrid, playerType) {
        this.lightingGrid = lightingGrid;
        this.playerType = playerType;
    }
    Switchboard.prototype.start = function () {
        var _this = this;
        event_bus_1.eventBus.register(event_bus_1.EventType.ActiveShapeChangedEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleActiveShapeChangedEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.CellChangeEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleCellChangeEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.RowsFilledEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.animateRowClearing(event.filledRowIdxs);
            }
            else {
                _this.animateJunkRowAdding(event.filledRowIdxs.length);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.HpChangedEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleHpChangedEvent(event);
            }
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.FallingSequencerEventType, function (event) {
            if (_this.playerType === event.playerType) {
                _this.handleFallingSequencerEvent(event);
            }
        });
    };
    Switchboard.prototype.step = function (elapsed) {
        //
    };
    Switchboard.prototype.handleActiveShapeChangedEvent = function (event) {
        var floorIdx = this.convertRowToFloor(event.shape.getRow());
        var panelIdx = event.shape.getCol();
        var color = this.convertColor(event.shape.color);
        var yTotalOffset = 0;
        var xTotalOffset = 0;
        var offsets = event.shape.getOffsets();
        for (var _i = 0, offsets_1 = offsets; _i < offsets_1.length; _i++) {
            var offset = offsets_1[_i];
            var offsetFloorIdx = floorIdx - offset.y;
            var offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
            yTotalOffset += offset.y;
            xTotalOffset += offset.x;
        }
        var yoff = (yTotalOffset / offsets.length) - 2;
        var xoff = xTotalOffset / offsets.length;
        this.lightingGrid.sendHighlighterTo(floorIdx + yoff, panelIdx + xoff, color);
        if (this.playerType === 0 /* Human */) {
            var activeShapeLightPosition = this.lightingGrid.getActiveShapeLightPosition();
        }
    };
    Switchboard.prototype.handleCellChangeEvent = function (event) {
        var floorIdx = this.convertRowToFloor(event.row);
        if (floorIdx >= lighting_grid_1.FLOOR_COUNT) {
            return; // Skip obstructed floors
        }
        var panelIdx = event.col;
        if (event.cell.getColor() === 0 /* Empty */) {
            this.lightingGrid.switchRoomOff(floorIdx, panelIdx);
        }
        else {
            var color = this.convertColor(event.cell.getColor());
            this.lightingGrid.switchRoomOn(floorIdx, panelIdx, color);
        }
    };
    Switchboard.prototype.animateRowClearing = function (filledRowIdxs) {
        var _this = this;
        var floorIdxs = [];
        for (var _i = 0, filledRowIdxs_1 = filledRowIdxs; _i < filledRowIdxs_1.length; _i++) {
            var filledRowIdx = filledRowIdxs_1[_i];
            var floorIdx = this.convertRowToFloor(filledRowIdx);
            floorIdxs.push(floorIdx);
        }
        this.lightingGrid.startRowClearingAnimation(floorIdxs, function () {
            event_bus_1.eventBus.fire(new rows_clear_animation_completed_event_1.RowsClearAnimationCompletedEvent(_this.playerType));
        });
    };
    /**
     * Remember that the junk rows have already been added on the board.
     *
     * Do not need to fire an event at the end of this animation because the board
     * does not need to listen for it (it listens for the clearing animation instead).
    */
    Switchboard.prototype.animateJunkRowAdding = function (junkRowCount) {
        this.lightingGrid.startJunkRowCurtainAnimation(junkRowCount);
    };
    Switchboard.prototype.handleHpChangedEvent = function (event) {
        this.lightingGrid.updateHp(event.hp, event.blinkLost);
    };
    Switchboard.prototype.handleFallingSequencerEvent = function (event) {
        this.lightingGrid.hideShapeLightsAndHighlighter();
    };
    /**
     * Convert cell row/col coordinates to floor/panel coordinates.
     * Account for the two floors that are obstructed from view. (?)
     */
    Switchboard.prototype.convertRowToFloor = function (row) {
        var thing = (lighting_grid_1.FLOOR_COUNT - row) + 1;
        return thing;
    };
    Switchboard.prototype.convertColor = function (color) {
        var value;
        switch (color) {
            case 1 /* Cyan */:
                value = 0x33cccc;
                break;
            case 2 /* Yellow */:
                value = 0xffff55;
                break;
            case 3 /* Purple */:
                value = 0xa020a0;
                break;
            case 4 /* Green */:
                value = 0x20a020;
                break;
            case 5 /* Red */:
                value = 0xff3333;
                break;
            case 6 /* Blue */:
                value = 0x4444cc;
                break;
            case 7 /* Orange */:
                value = 0xeed530;
                break;
            case 8 /* White */:
                value = 0xffffff;
                break;
            // Default or missing case is black.
            case 0 /* Empty */:
            default:
                value = 0x000000;
                break;
        }
        return value;
    };
    return Switchboard;
}());
exports.Switchboard = Switchboard;
},{"../../event/event-bus":12,"../../event/rows-clear-animation-completed-event":22,"./lighting-grid":50}],52:[function(require,module,exports){
"use strict";
// Dimensions of the entire spritesheet:
exports.SPRITESHEET_WIDTH = 256;
exports.SPRITESHEET_HEIGHT = 512;
// Dimensions of one frame within the spritesheet:
exports.FRAME_WIDTH = 48;
exports.FRAME_HEIGHT = 72;
var FILES_TO_PRELOAD = 3;
var StandeeAnimationTextureWrapper = (function () {
    function StandeeAnimationTextureWrapper(texture) {
        this.texture = texture;
    }
    return StandeeAnimationTextureWrapper;
}());
exports.StandeeAnimationTextureWrapper = StandeeAnimationTextureWrapper;
var StandeeAnimationTextureBase = (function () {
    function StandeeAnimationTextureBase() {
        this.textures = [];
        this.loadedCount = 0;
        this.currentTextureIdx = 0;
    }
    StandeeAnimationTextureBase.prototype.preload = function (signalThatOneTextureWasLoaded) {
        var _this = this;
        var textureLoadedHandler = function (texture) {
            // Have it show only one frame at a time:
            texture.repeat.set(exports.FRAME_WIDTH / exports.SPRITESHEET_WIDTH, exports.FRAME_HEIGHT / exports.SPRITESHEET_HEIGHT);
            _this.textures.push(texture);
            _this.loadedCount++;
            signalThatOneTextureWasLoaded(true);
        };
        var errorHandler = function () {
            signalThatOneTextureWasLoaded(false);
        };
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student2.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student3.png', textureLoadedHandler, undefined, errorHandler);
        return FILES_TO_PRELOAD;
    };
    StandeeAnimationTextureBase.prototype.newInstance = function () {
        var idx = this.getNextTextureIdx();
        var texture = this.textures[idx].clone(); // Cloning textures in the version of ThreeJS that I am currently using will duplicate them :(
        texture.needsUpdate = true;
        return new StandeeAnimationTextureWrapper(texture);
    };
    StandeeAnimationTextureBase.prototype.getNextTextureIdx = function () {
        this.currentTextureIdx++;
        if (this.currentTextureIdx >= FILES_TO_PRELOAD) {
            this.currentTextureIdx = 0;
        }
        return this.currentTextureIdx;
    };
    return StandeeAnimationTextureBase;
}());
exports.standeeAnimationTextureBase = new StandeeAnimationTextureBase();
},{}],53:[function(require,module,exports){
"use strict";
var standee_1 = require('./standee');
var event_bus_1 = require('../../event/event-bus');
var Y_OFFSET = 0.75; // Sets their feet on the ground plane.
var STANDEE_SPEED = 0.5;
var StandeeManager = (function () {
    function StandeeManager() {
        this.group = new THREE.Object3D();
        this.standees = new Map();
    }
    StandeeManager.prototype.start = function () {
        var _this = this;
        this.group.position.setY(Y_OFFSET);
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcPlacedEventType, function (event) {
            _this.handleNpcPlacedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcTeleportedEventType, function (event) {
            _this.handleNpcTeleportedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcMovementChangedEventType, function (event) {
            _this.handleNpcMovementChangedEvent(event);
        });
        event_bus_1.eventBus.register(event_bus_1.EventType.NpcFacingEventType, function (event) {
            _this.handleNpcFacingEvent(event);
        });
    };
    StandeeManager.prototype.step = function (elapsed) {
        this.standees.forEach(function (standee) {
            standee.step(elapsed);
        });
    };
    StandeeManager.prototype.handleNpcPlacedEvent = function (event) {
        var standee = new standee_1.Standee(event.npcId);
        standee.start();
        this.group.add(standee.group);
        this.standees.set(standee.npcId, standee);
        var x = event.x;
        var z = event.y;
        this.moveToPosition(standee, x, z);
    };
    StandeeManager.prototype.handleNpcTeleportedEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            this.moveToPosition(standee, x, z);
        }
    };
    StandeeManager.prototype.moveToPosition = function (standee, x, z) {
        standee.moveTo(x, z);
    };
    StandeeManager.prototype.handleNpcMovementChangedEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            standee.walkTo(x, z, STANDEE_SPEED);
        }
    };
    StandeeManager.prototype.handleNpcFacingEvent = function (event) {
        var standee = this.standees.get(event.npcId);
        if (standee != null) {
            var x = event.x;
            var z = event.y;
            standee.lookAt(x, z);
        }
    };
    return StandeeManager;
}());
exports.standeeManager = new StandeeManager();
},{"../../event/event-bus":12,"./standee":55}],54:[function(require,module,exports){
/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>
"use strict";
var camera_wrapper_1 = require('../camera-wrapper');
var standee_animation_texture_base_1 = require('./standee-animation-texture-base');
var STANDARD_DELAY = 225;
var WALK_UP_OR_DOWN_DELAY = Math.floor(STANDARD_DELAY * (2 / 3)); // Because up/down walk cycles have more frames. 
var scratchVector1 = new THREE.Vector3();
var scratchVector2 = new THREE.Vector3();
var StandeeAnimationFrame = (function () {
    function StandeeAnimationFrame(row, col) {
        this.row = row;
        this.col = col;
    }
    return StandeeAnimationFrame;
}());
var StandeeAnimation = (function () {
    function StandeeAnimation(type, next) {
        this.type = type;
        if (next) {
            this.next = next;
        }
        else {
            this.next = type;
        }
        this.frames = [];
        this.delays = [];
        this.currentFrameIdx = 0;
        this.currentFrameTimeElapsed = 0;
        this.finished = false;
    }
    StandeeAnimation.prototype.push = function (frame, delay) {
        if (delay === void 0) { delay = STANDARD_DELAY; }
        this.frames.push(frame);
        this.delays.push(delay);
    };
    StandeeAnimation.prototype.step = function (elapsed) {
        this.currentFrameTimeElapsed += elapsed;
        if (this.currentFrameTimeElapsed >= this.delays[this.currentFrameIdx]) {
            this.currentFrameTimeElapsed = 0;
            this.currentFrameIdx++;
            if (this.currentFrameIdx >= this.frames.length) {
                this.currentFrameIdx = 0; // Shouldn't be used anymore, but prevent out-of-bounds anyway.
                this.finished = true;
            }
        }
    };
    StandeeAnimation.prototype.isFinished = function () {
        return this.finished;
    };
    StandeeAnimation.prototype.getCurrentFrame = function () {
        return this.frames[this.currentFrameIdx];
    };
    return StandeeAnimation;
}());
var StandeeSpriteWrapper = (function () {
    function StandeeSpriteWrapper() {
        this.group = new THREE.Object3D();
        // Initialize ThreeJS objects: 
        this.textureWrapper = standee_animation_texture_base_1.standeeAnimationTextureBase.newInstance();
        var material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);
        // Half size them and position their feet on the ground.
        this.group.scale.set(0.5, 0.5, 0.5);
        this.group.position.set(0, -0.4, 0);
        // Initialize default animation to standing facing down:
        this.currentAnimation = createStandDown();
    }
    StandeeSpriteWrapper.prototype.start = function () {
        // TODO: Set this elsewhere
    };
    StandeeSpriteWrapper.prototype.step = function (elapsed) {
        this.adjustLighting(elapsed);
        this.stepAnimation(elapsed);
    };
    /**
     * Only switches if the given animation is different from the current one.
     */
    StandeeSpriteWrapper.prototype.switchAnimation = function (type) {
        var animation = determineAnimation(type);
        if (this.currentAnimation.type !== animation.type) {
            this.currentAnimation = animation;
        }
    };
    StandeeSpriteWrapper.prototype.adjustLighting = function (elapsed) {
        // TODO: Not yet sure if I'll need to use the elapsed variable here.
        // TODO: Move magic numbers into same equations as the NPC
        this.sprite.getWorldPosition(scratchVector1);
        camera_wrapper_1.cameraWrapper.camera.getWorldPosition(scratchVector2);
        var distanceSquared = scratchVector1.distanceToSquared(scratchVector2);
        var value = Math.max(0.20, 1.0 - (Math.min(1.0, distanceSquared / 225)));
        this.sprite.material.color.setRGB(value, value, value);
    };
    StandeeSpriteWrapper.prototype.stepAnimation = function (elapsed) {
        if (this.currentAnimation == null) {
            return;
        }
        this.currentAnimation.step(elapsed);
        if (this.currentAnimation.isFinished()) {
            this.currentAnimation = determineAnimation(this.currentAnimation.next);
        }
        var frame = this.currentAnimation.getCurrentFrame();
        // Convert frame coordinates to texture coordinates and set the current one
        var xpct = (frame.col * standee_animation_texture_base_1.FRAME_WIDTH) / standee_animation_texture_base_1.SPRITESHEET_WIDTH;
        var ypct = (((standee_animation_texture_base_1.SPRITESHEET_HEIGHT / standee_animation_texture_base_1.FRAME_HEIGHT) - 1 - frame.row) * standee_animation_texture_base_1.FRAME_HEIGHT) / standee_animation_texture_base_1.SPRITESHEET_HEIGHT;
        this.textureWrapper.texture.offset.set(xpct, ypct);
    };
    return StandeeSpriteWrapper;
}());
exports.StandeeSpriteWrapper = StandeeSpriteWrapper;
function determineAnimation(type) {
    var animation;
    switch (type) {
        case 0 /* StandUp */:
            animation = createStandUp();
            break;
        case 4 /* WalkUp */:
            animation = createWalkUp();
            break;
        case 1 /* StandDown */:
            animation = createStandDown();
            break;
        case 5 /* WalkDown */:
            animation = createWalkDown();
            break;
        case 2 /* StandLeft */:
            animation = createStandLeft();
            break;
        case 6 /* WalkLeft */:
            animation = createWalkLeft();
            break;
        case 3 /* StandRight */:
            animation = createStandRight();
            break;
        case 7 /* WalkRight */:
            animation = createWalkRight();
            break;
        case 8 /* CheerUp */:
            animation = createCheerUp();
            break;
        case 9 /* PanicUp */:
            animation = createPanicUp();
            break;
        case 10 /* PanicDown */:
            animation = createPanicDown();
            break;
        default:
            console.log('Should not get here');
    }
    return animation;
}
// Standing Up
var standUpFrame1 = new StandeeAnimationFrame(2, 0);
function createStandUp() {
    var animation = new StandeeAnimation(0 /* StandUp */);
    animation.push(standUpFrame1);
    return animation;
}
// Walking Up
var walkUpFrame1 = new StandeeAnimationFrame(2, 0);
var walkUpFrame2 = new StandeeAnimationFrame(2, 1);
var walkUpFrame3 = new StandeeAnimationFrame(2, 2);
var walkUpFrame4 = new StandeeAnimationFrame(3, 3);
var walkUpFrame5 = new StandeeAnimationFrame(4, 3);
var walkUpFrame6 = new StandeeAnimationFrame(5, 3);
function createWalkUp() {
    var animation = new StandeeAnimation(4 /* WalkUp */);
    animation.push(walkUpFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}
// Standing Down
var standDownFrame1 = new StandeeAnimationFrame(0, 0);
function createStandDown() {
    var animation = new StandeeAnimation(1 /* StandDown */);
    animation.push(standDownFrame1);
    return animation;
}
// Walking Down
var walkDownFrame1 = new StandeeAnimationFrame(0, 0);
var walkDownFrame2 = new StandeeAnimationFrame(0, 1);
var walkDownFrame3 = new StandeeAnimationFrame(0, 2);
var walkDownFrame4 = new StandeeAnimationFrame(0, 3);
var walkDownFrame5 = new StandeeAnimationFrame(1, 3);
var walkDownFrame6 = new StandeeAnimationFrame(2, 3);
function createWalkDown() {
    var animation = new StandeeAnimation(5 /* WalkDown */);
    animation.push(walkDownFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}
// Standing Left
var standLeftFrame1 = new StandeeAnimationFrame(1, 1);
function createStandLeft() {
    var animation = new StandeeAnimation(2 /* StandLeft */);
    animation.push(standLeftFrame1);
    return animation;
}
// Walking Left
var walkLeftFrame1 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame2 = new StandeeAnimationFrame(1, 0);
var walkLeftFrame3 = new StandeeAnimationFrame(1, 1);
var walkLeftFrame4 = new StandeeAnimationFrame(1, 2);
function createWalkLeft() {
    var animation = new StandeeAnimation(6 /* WalkLeft */);
    animation.push(walkLeftFrame1);
    animation.push(walkLeftFrame2);
    animation.push(walkLeftFrame3);
    animation.push(walkLeftFrame4);
    return animation;
}
// Standing Right
var standRightFrame1 = new StandeeAnimationFrame(1, 4);
function createStandRight() {
    var animation = new StandeeAnimation(3 /* StandRight */);
    animation.push(standRightFrame1);
    return animation;
}
// Walking Right
var walkRightFrame1 = new StandeeAnimationFrame(1, 4);
var walkRightFrame2 = new StandeeAnimationFrame(2, 4);
var walkRightFrame3 = new StandeeAnimationFrame(1, 4);
var walkRightFrame4 = new StandeeAnimationFrame(0, 4);
function createWalkRight() {
    var animation = new StandeeAnimation(7 /* WalkRight */);
    animation.push(walkRightFrame1);
    animation.push(walkRightFrame2);
    animation.push(walkRightFrame3);
    animation.push(walkRightFrame4);
    return animation;
}
// Cheer Up
var cheerUpFrame1 = new StandeeAnimationFrame(2, 0);
var cheerUpFrame2 = new StandeeAnimationFrame(3, 0);
var cheerUpFrame3 = new StandeeAnimationFrame(3, 1);
var cheerUpFrame4 = new StandeeAnimationFrame(3, 0);
function createCheerUp() {
    var animation = new StandeeAnimation(8 /* CheerUp */);
    animation.push(cheerUpFrame1);
    animation.push(cheerUpFrame2);
    animation.push(cheerUpFrame3);
    animation.push(cheerUpFrame4);
    return animation;
}
// Panic Up
var panicUpFrame1 = new StandeeAnimationFrame(2, 0);
var panicUpFrame2 = new StandeeAnimationFrame(3, 2);
var panicUpFrame3 = new StandeeAnimationFrame(4, 0);
var panicUpFrame4 = new StandeeAnimationFrame(3, 2);
function createPanicUp() {
    var animation = new StandeeAnimation(9 /* PanicUp */);
    animation.push(panicUpFrame1);
    animation.push(panicUpFrame2);
    animation.push(panicUpFrame3);
    animation.push(panicUpFrame4);
    return animation;
}
// Panic Down
var panicDownFrame1 = new StandeeAnimationFrame(0, 0);
var panicDownFrame2 = new StandeeAnimationFrame(4, 1);
var panicDownFrame3 = new StandeeAnimationFrame(4, 2);
var panicDownFrame4 = new StandeeAnimationFrame(4, 1);
function createPanicDown() {
    var animation = new StandeeAnimation(10 /* PanicDown */);
    animation.push(panicDownFrame1);
    animation.push(panicDownFrame2);
    animation.push(panicDownFrame3);
    animation.push(panicDownFrame4);
    return animation;
}
},{"../camera-wrapper":45,"./standee-animation-texture-base":52}],55:[function(require,module,exports){
"use strict";
var event_bus_1 = require('../../event/event-bus');
var standee_movement_ended_event_1 = require('../../event/standee-movement-ended-event');
var standee_sprite_wrapper_1 = require('./standee-sprite-wrapper');
var camera_wrapper_1 = require('../camera-wrapper');
var Standee = (function () {
    function Standee(npcId) {
        this.npcId = npcId;
        this.group = new THREE.Object3D();
        this.spriteWrapper = new standee_sprite_wrapper_1.StandeeSpriteWrapper();
        this.group.add(this.spriteWrapper.group);
        this.walkTweenElapsed = 0;
        this.walkTween = null;
        this.facing = new THREE.Vector3();
    }
    Standee.prototype.start = function () {
        this.group.position.set(-200, 0, -200);
    };
    Standee.prototype.step = function (elapsed) {
        this.stepWalk(elapsed);
        this.ensureCorrectAnimation();
        this.spriteWrapper.step(elapsed);
    };
    /**
     * Immediately set standee on given position.
     */
    Standee.prototype.moveTo = function (x, z) {
        this.group.position.set(x, 0, z);
    };
    /**
     * Set standee in motion towards given position.
     * Speed dimension is 1 unit/sec.
     */
    Standee.prototype.walkTo = function (x, z, speed) {
        var _this = this;
        // Calculate how long it would take, given the speed requested.
        var vector = new THREE.Vector3(x, 0, z).sub(this.group.position);
        var distance = vector.length();
        var time = (distance / speed) * 1000;
        // Delegate to tween.js. Pass in closures as callbacks because otherwise 'this' will refer
        // to the position object, when executing stopWalk().
        this.walkTweenElapsed = 0;
        this.walkTween = new TWEEN.Tween(this.group.position)
            .to({ x: x, z: z }, time)
            .onComplete(function () { _this.stopWalk(); })
            .start(this.walkTweenElapsed);
        // Update direction this standee will be facing when walking.
        this.facing.setX(x - this.group.position.x);
        this.facing.setZ(z - this.group.position.z);
    };
    Standee.prototype.lookAt = function (x, z) {
        this.facing.setX(x - this.group.position.x);
        this.facing.setZ(z - this.group.position.z);
    };
    Standee.prototype.stepWalk = function (elapsed) {
        if (this.walkTween != null) {
            this.walkTweenElapsed += elapsed;
            this.walkTween.update(this.walkTweenElapsed);
        }
    };
    Standee.prototype.stopWalk = function () {
        this.walkTweenElapsed = 0;
        this.walkTween = null;
        event_bus_1.eventBus.fire(new standee_movement_ended_event_1.StandeeMovementEndedEvent(this.npcId, this.group.position.x, this.group.position.z));
    };
    Standee.prototype.ensureCorrectAnimation = function () {
        // let target = this.group.position.clone();
        // target.setY(target.y + 0.5);
        // cameraWrapper.camera.lookAt(target);
        // Angle between two vectors: http://stackoverflow.com/a/21484228
        var worldDirection = camera_wrapper_1.cameraWrapper.camera.getWorldDirection();
        var angle = Math.atan2(this.facing.z, this.facing.x) - Math.atan2(worldDirection.z, worldDirection.x);
        if (angle < 0)
            angle += 2 * Math.PI;
        angle *= (180 / Math.PI); // It's my party and I'll use degrees if I want to.
        if (this.walkTween != null) {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(4 /* WalkUp */);
            }
            else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(7 /* WalkRight */);
            }
            else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(5 /* WalkDown */);
            }
            else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(6 /* WalkLeft */);
            }
        }
        else {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(0 /* StandUp */);
            }
            else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(3 /* StandRight */);
            }
            else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(1 /* StandDown */);
            }
            else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(2 /* StandLeft */);
            }
        }
    };
    return Standee;
}());
exports.Standee = Standee;
},{"../../event/event-bus":12,"../../event/standee-movement-ended-event":24,"../camera-wrapper":45,"./standee-sprite-wrapper":54}],56:[function(require,module,exports){
"use strict";
var camera_wrapper_1 = require('./camera-wrapper');
var sky_1 = require('./world/sky');
var ground_1 = require('./world/ground');
var lighting_grid_1 = require('./lighting/lighting-grid');
var switchboard_1 = require('./lighting/switchboard');
var standee_manager_1 = require('./standee/standee-manager');
var View = (function () {
    function View() {
        this.canvas = document.getElementById('canvas');
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        this.humanGrid = new lighting_grid_1.LightingGrid(0 /* DecreasesRightToLeft */, 1 /* RightToLeft */);
        this.humanSwitchboard = new switchboard_1.Switchboard(this.humanGrid, 0 /* Human */);
        this.aiGrid = new lighting_grid_1.LightingGrid(1 /* DecreasesLeftToRight */, 0 /* LeftToRight */);
        this.aiSwitchboard = new switchboard_1.Switchboard(this.aiGrid, 1 /* Ai */);
    }
    View.prototype.start = function () {
        this.humanGrid.start();
        this.humanSwitchboard.start();
        this.aiGrid.start();
        this.aiSwitchboard.start();
        this.doStart();
        camera_wrapper_1.cameraWrapper.start();
        sky_1.sky.start();
        ground_1.ground.start();
        standee_manager_1.standeeManager.start();
        // The canvas should have been hidden until setup is complete.
        this.canvas.style.opacity = '1';
        this.canvas.style.transition = 'opacity 2s';
    };
    View.prototype.step = function (elapsed) {
        camera_wrapper_1.cameraWrapper.step(elapsed);
        sky_1.sky.step(elapsed);
        ground_1.ground.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);
        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);
        standee_manager_1.standeeManager.step(elapsed);
        this.renderer.render(this.scene, camera_wrapper_1.cameraWrapper.camera);
    };
    View.prototype.doStart = function () {
        var _this = this;
        this.scene.add(sky_1.sky.group);
        this.scene.add(ground_1.ground.group);
        this.scene.add(standee_manager_1.standeeManager.group);
        this.scene.add(this.humanGrid.group);
        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(12);
        this.aiGrid.group.position.setZ(-2);
        this.aiGrid.group.rotation.y = -Math.PI / 3.5;
        var spotLightColor = 0x9999ee;
        var spotLight = new THREE.SpotLight(spotLightColor);
        spotLight.position.set(-3, 0.75, 20);
        spotLight.target = this.aiGrid.group;
        this.scene.add(spotLight);
        camera_wrapper_1.cameraWrapper.camera.position.set(5, 0.4, 15);
        camera_wrapper_1.cameraWrapper.lookAtStartingFocus();
        camera_wrapper_1.cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', function () {
            camera_wrapper_1.cameraWrapper.updateRendererSize(_this.renderer);
        });
        // this.addDebugBox();
    };
    return View;
}());
exports.view = new View();
},{"./camera-wrapper":45,"./lighting/lighting-grid":50,"./lighting/switchboard":51,"./standee/standee-manager":53,"./world/ground":57,"./world/sky":58}],57:[function(require,module,exports){
"use strict";
// 1) tree
var FILES_TO_PRELOAD = 1;
var Ground = (function () {
    function Ground() {
        this.group = new THREE.Object3D();
        var geometry = new THREE.PlaneGeometry(300, 300);
        var material = new THREE.MeshLambertMaterial({ emissive: 0x021d03, emissiveIntensity: 1.0 });
        this.grass = new THREE.Mesh(geometry, material);
        this.grass.rotation.x = (Math.PI * 3) / 2;
        this.grass.position.set(0, 0, 0);
        this.treesSpawned = false;
        this.treeTexture = null;
    }
    Ground.prototype.start = function () {
        this.group.add(this.grass);
    };
    Ground.prototype.step = function (elapsed) {
        if (this.treesSpawned === false && this.treeTexture != null) {
            this.spawnTree(-2, 1);
            this.spawnTree(9.5, 1);
            this.spawnTree(14, 7);
            this.treesSpawned = true;
        }
    };
    Ground.prototype.preload = function (signalThatTextureWasLoaded) {
        var _this = this;
        var textureLoadedHandler = function (texture) {
            _this.treeTexture = texture;
            signalThatTextureWasLoaded(true);
        };
        var errorHandler = function () {
            signalThatTextureWasLoaded(false);
        };
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('tree.png', textureLoadedHandler, undefined, errorHandler);
        return FILES_TO_PRELOAD;
    };
    Ground.prototype.spawnTree = function (x, z) {
        var material = new THREE.SpriteMaterial({ map: this.treeTexture });
        var sprite = new THREE.Sprite(material);
        sprite.scale.set(2.5, 2.5, 2.5);
        sprite.position.set(x, 1.1, z);
        sprite.material.color.setRGB(0.5, 0.5, 0.5);
        this.group.add(sprite);
    };
    return Ground;
}());
exports.ground = new Ground();
},{}],58:[function(require,module,exports){
"use strict";
var START_Z_ANGLE = -(Math.PI / 30);
var END_Z_ANGLE = Math.PI / 30;
var ROTATION_SPEED = 0.0005;
var Sky = (function () {
    function Sky() {
        this.group = new THREE.Object3D();
        var geometry = new THREE.SphereGeometry(50, 32, 32); // new THREE.BoxGeometry(150, 150, 150);
        var texture = new THREE.Texture(this.generateTexture());
        texture.needsUpdate = true;
        var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        this.dome = new THREE.Mesh(geometry, material);
        this.dome.material.side = THREE.BackSide;
        this.dome.position.set(10, 10, 0);
        this.group.add(this.dome);
        this.rdz = -ROTATION_SPEED;
    }
    Sky.prototype.start = function () {
        this.dome.rotation.set(0, 0, START_Z_ANGLE);
    };
    Sky.prototype.step = function (elapsed) {
        this.dome.rotation.set(0, 0, this.dome.rotation.z + this.rdz);
        if (this.dome.rotation.z >= END_Z_ANGLE) {
            this.rdz = -ROTATION_SPEED;
        }
        else if (this.dome.rotation.z <= START_Z_ANGLE) {
            this.rdz = ROTATION_SPEED;
        }
    };
    /**
     * Based on: http://stackoverflow.com/a/19992505
     */
    Sky.prototype.generateTexture = function () {
        var size = 512;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.rect(0, 0, size, size);
        var gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0.00, '#000000');
        gradient.addColorStop(0.40, '#131c45');
        gradient.addColorStop(0.75, '#ff9544');
        gradient.addColorStop(0.85, '#131c45');
        gradient.addColorStop(1.00, '#131c45');
        ctx.fillStyle = gradient;
        ctx.fill();
        return canvas;
    };
    return Sky;
}());
exports.sky = new Sky();
},{}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2NvbnRyb2xsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2ludHJvLWhhbmRsZXIudHMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVyL2tleWJvYXJkLnRzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlci9wbGF5aW5nLWhhbmRsZXIudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vY2VsbC50cyIsInNyYy9zY3JpcHRzL2RvbWFpbi9jb25zdGFudHMudHMiLCJzcmMvc2NyaXB0cy9kb21haW4vcGxheWVyLW1vdmVtZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9hY3RpdmUtc2hhcGUtZW5kZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9jZWxsLWNoYW5nZS1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2V2ZW50LWJ1cy50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvZ2FtZS1zdGF0ZS1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvaHAtY2hhbmdlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L2ludHJvLWtleS1wcmVzc2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLWZhY2luZy1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy1tb3ZlbWVudC1jaGFuZ2VkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvbnBjLXBsYWNlZC1ldmVudC50cyIsInNyYy9zY3JpcHRzL2V2ZW50L25wYy10ZWxlcG9ydGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcm93cy1jbGVhci1hbmltYXRpb24tY29tcGxldGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZXZlbnQvcm93cy1maWxsZWQtZXZlbnQudHMiLCJzcmMvc2NyaXB0cy9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50LnRzIiwic3JjL3NjcmlwdHMvZ2FtZS1zdGF0ZS50cyIsInNyYy9zY3JpcHRzL21haW4udHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9haS9haS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2JvYXJkL2JvYXJkLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvZmFsbGluZy1zZXF1ZW5jZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC9zaGFwZS1mYWN0b3J5LnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvYm9hcmQvc2hhcGUudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ib2FyZC93aW4udHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9lbmRlZC1hY3Rpdml0eS50cyIsInNyYy9zY3JpcHRzL21vZGVsL2ludHJvLWFjdGl2aXR5LnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbW9kZWwudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvY3Jvd2Qtc3RhdHMudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLW1hbmFnZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9ucGMvbnBjLnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvbnBjL3JlbGVhc2UtdGltZXIudHMiLCJzcmMvc2NyaXB0cy9tb2RlbC9wbGF5aW5nLWFjdGl2aXR5LnRzIiwic3JjL3NjcmlwdHMvbW9kZWwvdml0YWxzLnRzIiwic3JjL3NjcmlwdHMvcHJlbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvc291bmQvc291bmQtbG9hZGVyLnRzIiwic3JjL3NjcmlwdHMvc291bmQvc291bmQtbWFuYWdlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvY2FtZXJhLXdyYXBwZXIudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLXByZWxvYWRlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvYnVpbGRpbmcudHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2N1cnRhaW4udHMiLCJzcmMvc2NyaXB0cy92aWV3L2xpZ2h0aW5nL2hwLXBhbmVscy50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvbGlnaHRpbmctZ3JpZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvbGlnaHRpbmcvc3dpdGNoYm9hcmQudHMiLCJzcmMvc2NyaXB0cy92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlci50cyIsInNyYy9zY3JpcHRzL3ZpZXcvc3RhbmRlZS9zdGFuZGVlLXNwcml0ZS13cmFwcGVyLnRzIiwic3JjL3NjcmlwdHMvdmlldy9zdGFuZGVlL3N0YW5kZWUudHMiLCJzcmMvc2NyaXB0cy92aWV3L3ZpZXcudHMiLCJzcmMvc2NyaXB0cy92aWV3L3dvcmxkL2dyb3VuZC50cyIsInNyYy9zY3JpcHRzL3ZpZXcvd29ybGQvc2t5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLHlCQUE0QixZQUFZLENBQUMsQ0FBQTtBQUN6QywyQkFBdUMsZUFBZSxDQUFDLENBQUE7QUFDdkQsOEJBQTJCLGlCQUFpQixDQUFDLENBQUE7QUFDN0MsZ0NBQTZCLG1CQUFtQixDQUFDLENBQUE7QUFFakQ7SUFBQTtJQXNCQSxDQUFDO0lBcEJHLDBCQUFLLEdBQUw7UUFDSSxtQkFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLGdDQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELHlCQUFJLEdBQUosVUFBSyxPQUFlO1FBQ2hCLE1BQU0sQ0FBQyxDQUFDLHNCQUFTLENBQUMsVUFB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LEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNsRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FB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QUFDO1FBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQXZEQSxBQXVEQyxJQUFBO0FBQ1ksV0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtrZXlib2FyZCwgS2V5fSBmcm9tICcuL2tleWJvYXJkJztcclxuaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge2ludHJvSGFuZGxlcn0gZnJvbSAnLi9pbnRyby1oYW5kbGVyJztcclxuaW1wb3J0IHtwbGF5aW5nSGFuZGxlcn0gZnJvbSAnLi9wbGF5aW5nLWhhbmRsZXInO1xyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAga2V5Ym9hcmQuc3RhcnQoKTtcclxuICAgICAgICBwbGF5aW5nSGFuZGxlci5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3dpdGNoIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5JbnRybzpcclxuICAgICAgICAgICAgICAgIGludHJvSGFuZGxlci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5QbGF5aW5nOlxyXG4gICAgICAgICAgICAgICAgcGxheWluZ0hhbmRsZXIuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuRW5kZWQ6XHJcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBFbmQgb2YgZ2FtZSwgbm8gbW9yZSBpbnB1dCBuZWNlc3NhcnkuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTsiLCJpbXBvcnQge2tleWJvYXJkfSBmcm9tICcuL2tleWJvYXJkJztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtJbnRyb0tleVByZXNzZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvaW50cm8ta2V5LXByZXNzZWQtZXZlbnQnO1xyXG5cclxuY2xhc3MgSW50cm9IYW5kbGVyIHtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAga2V5Ym9hcmQuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgaWYgKGtleWJvYXJkLmlzQW55S2V5RG93bkFuZFVuaGFuZGxlZCgpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEludHJvS2V5UHJlc3NlZEV2ZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgaW50cm9IYW5kbGVyID0gbmV3IEludHJvSGFuZGxlcigpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIEtleSB7XHJcbiAgICBMZWZ0LFxyXG4gICAgVXAsXHJcbiAgICBEb3duLFxyXG4gICAgUmlnaHQsXHJcbiAgICBEcm9wLFxyXG4gICAgUGF1c2UsXHJcbiAgICAvLyBSZXN0IG9mIHRoZXNlIGFyZSBzcGVjaWFsIGRpcmVjdGl2ZXNcclxuICAgIE90aGVyLFxyXG4gICAgSWdub3JlLFxyXG4gICAgUHJldmVudFxyXG59XHJcblxyXG5jb25zdCBlbnVtIFN0YXRlIHtcclxuICAgIERvd24sXHJcbiAgICBVcCxcclxuICAgIEhhbmRsaW5nXHJcbn1cclxuXHJcbmNvbnN0IEtFWV9SRVBFQVRfREVMQVlfSU5JVElBTCAgPSA1NTA7XHJcbmNvbnN0IEtFWV9SRVBFQVRfREVMQVlfQ09OVElOVUUgPSAyMDA7XHJcblxyXG5jbGFzcyBLZXlib2FyZCB7XHJcbiAgICBwcml2YXRlIGtleVN0YXRlOiBNYXA8S2V5LFN0YXRlPjtcclxuXHJcbiAgICBwcml2YXRlIHByZXZpb3VzS2V5Q29kZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50S2V5Q29kZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBrZXlIZWxkRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBrZXlIZWxkSW5pdGlhbDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBTZWUgb25ibHVyIGhhbmRsZXIgYmVsb3cgZm9yIG1vcmUgY29tbWVudHMuXHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZSA9IG5ldyBNYXA8S2V5LFN0YXRlPigpO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNLZXlDb2RlID0gLTE7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50S2V5Q29kZSA9IC0xO1xyXG4gICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMua2V5SGVsZEluaXRpYWwgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRUb1N0YXRlKGV2ZW50LCBTdGF0ZS5Eb3duKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFRvU3RhdGUoZXZlbnQsIFN0YXRlLlVwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBQcmV2ZW50IFwic3R1Y2tcIiBrZXkgaWYgaGVsZCBkb3duIGFuZCB3aW5kb3cgbG9zZXMgZm9jdXMuXHJcbiAgICAgICAgd2luZG93Lm9uYmx1ciA9ICgpID0+IHtcclxuICAgICAgICAgICAgLy8gSnVzdCByZS1pbml0YWlsaXplIGV2ZXJ5dGhpbmcgbGlrZSB0aGUgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdGhpcy5rZXlTdGF0ZSA9IG5ldyBNYXA8S2V5LFN0YXRlPigpO1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzS2V5Q29kZSA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlDb2RlID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMua2V5SGVsZEVsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmtleUhlbGRJbml0aWFsID0gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGlzIGRvZXMgaXMgaGFuZGxlIGlmIHRoZSBwbGF5ZXIgaXMgaG9sZGluZyBkb3duIGEga2V5IGZvciBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUuXHJcbiAgICAgKiBJZiBzbywgZGV0ZXJtaW5lIHdoZXRoZXIgb3Igbm90IHRvIGVtdWxhdGUgdGhlaXIgaGF2aW5nIHByZXNzZWQgdGhlIGtleSBkdXJpbmcgdGhpcyBmcmFtZS5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50S2V5Q29kZSAhPT0gdGhpcy5wcmV2aW91c0tleUNvZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCArPSBlbGFwc2VkO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVwZGF0ZVN0YXRlOiBib29sZWFuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlIZWxkSW5pdGlhbCA9PT0gdHJ1ZSAmJiB0aGlzLmtleUhlbGRFbGFwc2VkID49IEtFWV9SRVBFQVRfREVMQVlfSU5JVElBTCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkSW5pdGlhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlIZWxkRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVTdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlIZWxkSW5pdGlhbCA9PT0gZmFsc2UgJiYgdGhpcy5rZXlIZWxkRWxhcHNlZCA+PSBLRVlfUkVQRUFUX0RFTEFZX0NPTlRJTlVFKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZVN0YXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHVwZGF0ZVN0YXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQga2V5ID0gdGhpcy5rZXlDb2RlVG9LZXkodGhpcy5jdXJyZW50S2V5Q29kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKGtleSwgU3RhdGUuRG93biwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmtleUhlbGRFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5rZXlIZWxkSW5pdGlhbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnRG93bicuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bihrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmtleVN0YXRlLmdldChrZXkpID09PSBTdGF0ZS5Eb3duO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGlmIGdpdmVuIGtleSBpcyAnZG93bicuIEFsc28gc2V0cyB0aGUga2V5IGZyb20gJ0Rvd24nIHRvICdIYW5kbGluZycuXHJcbiAgICAgKi9cclxuICAgIGlzRG93bkFuZFVuaGFuZGxlZChrZXk6IEtleSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRG93bihrZXkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGUuc2V0KGtleSwgU3RhdGUuSGFuZGxpbmcpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IFRoaXMgd2Fzbid0IHNldCBpbiBtYXppbmc7IG5lZWQgdG8gc2VlIHdoeS5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPOiBOb3Qgc3VyZSBpZiB0aGlzIHdvdWxkIHdvcmsgaW4gdGhpcyBnYW1lIHdpdGggdGhlIGtleSBkZWxheSBjYXB0dXJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIFJldHVybnMgaWYgYW55IGtleSBpcyAnZG93bicuIEFsc28gc2V0IGFsbCAnRG93bicga2V5cyB0byAnSGFuZGxpbmcnLlxyXG4gICAgICovXHJcbiAgICBpc0FueUtleURvd25BbmRVbmhhbmRsZWQoKSB7XHJcbiAgICAgICAgbGV0IGFueUtleURvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLmZvckVhY2goKHN0YXRlOiBTdGF0ZSwga2V5OiBLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIFN0YXRlLkhhbmRsaW5nKTtcclxuICAgICAgICAgICAgICAgIGFueUtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFueUtleURvd247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudFRvU3RhdGUoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gU3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRLZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09IFN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEtleUNvZGUgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0tleUNvZGUgPSAtMTtcclxuICAgICAgIH1cclxuXHJcbiAgICAgICBsZXQga2V5ID0gdGhpcy5rZXlDb2RlVG9LZXkoZXZlbnQua2V5Q29kZSk7XHJcbiAgICAgICB0aGlzLmtleVRvU3RhdGUoa2V5LCBzdGF0ZSwgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUga2V5Q29kZVRvS2V5KGtleUNvZGU6IG51bWJlcik6IEtleSB7XHJcbiAgICAgICAgbGV0IGtleSA9IEtleS5PdGhlcjtcclxuXHJcbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIERpcmVjdGlvbmFscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDY1OiAvLyAnYSdcclxuICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAga2V5ID0gS2V5LkxlZnQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gJ3cnXHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuVXA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gJ2QnXHJcbiAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gJ3MnXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5Eb3duO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzI6IC8vIHNwYWNlXHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuRHJvcDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gUGF1c2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgODA6IC8vICdwJ1xyXG4gICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2NcclxuICAgICAgICAgICAgY2FzZSAxMzogLy8gZW50ZXIga2V5XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUGF1c2U7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZ25vcmUgY2VydGFpbiBrZXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgY2FzZSA4MjogICAgLy8gJ3InXHJcbiAgICAgICAgICAgIGNhc2UgMTg6ICAgIC8vIGFsdFxyXG4gICAgICAgICAgICBjYXNlIDIyNDogICAvLyBhcHBsZSBjb21tYW5kIChmaXJlZm94KVxyXG4gICAgICAgICAgICBjYXNlIDE3OiAgICAvLyBhcHBsZSBjb21tYW5kIChvcGVyYSlcclxuICAgICAgICAgICAgY2FzZSA5MTogICAgLy8gYXBwbGUgY29tbWFuZCwgbGVmdCAoc2FmYXJpL2Nocm9tZSlcclxuICAgICAgICAgICAgY2FzZSA5MzogICAgLy8gYXBwbGUgY29tbWFuZCwgcmlnaHQgKHNhZmFyaS9jaHJvbWUpXHJcbiAgICAgICAgICAgIGNhc2UgODQ6ICAgIC8vICd0JyAoaS5lLiwgb3BlbiBhIG5ldyB0YWIpXHJcbiAgICAgICAgICAgIGNhc2UgNzg6ICAgIC8vICduJyAoaS5lLiwgb3BlbiBhIG5ldyB3aW5kb3cpXHJcbiAgICAgICAgICAgIGNhc2UgMjE5OiAgIC8vIGxlZnQgYnJhY2tldHNcclxuICAgICAgICAgICAgY2FzZSAyMjE6ICAgLy8gcmlnaHQgYnJhY2tldHNcclxuICAgICAgICAgICAgICAgIGtleSA9IEtleS5JZ25vcmU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc29tZSB1bndhbnRlZCBiZWhhdmlvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICBjYXNlIDE5MTogICAvLyBmb3J3YXJkIHNsYXNoIChwYWdlIGZpbmQpXHJcbiAgICAgICAgICAgIGNhc2UgOTogICAgIC8vIHRhYiAoY2FuIGxvc2UgZm9jdXMpXHJcbiAgICAgICAgICAgIGNhc2UgMTY6ICAgIC8vIHNoaWZ0XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuUHJldmVudDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gQWxsIG90aGVyIGtleXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBLZXkuT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUga2V5VG9TdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlLCBldmVudDogS2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICBjYXNlIEtleS5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuTGVmdCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlVwOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuVXAsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLSBjb21tZW50ZWQgZm9yIGlmIHRoZSB1c2VyIHdhbnRzIHRvIGNtZCt3IG9yIGN0cmwrd1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuUmlnaHQsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5Eb3duOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuRG93biwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5LkRyb3A6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5Ecm9wLCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXkuUGF1c2U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEtleS5QYXVzZSwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1heWJlIGFkZCBhIGRlYnVnIGtleSBoZXJlICgnZicpXHJcbiAgICAgICAgICAgIGNhc2UgS2V5Lklnbm9yZTpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleS5QcmV2ZW50OlxyXG4gICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgS2V5Lk90aGVyOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShLZXkuT3RoZXIsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV2ZW50ICE9IG51bGwgJiYgcHJldmVudERlZmF1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShrZXk6IEtleSwgc3RhdGU6IFN0YXRlLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgLy8gQWx3YXlzIHNldCAndXAnXHJcbiAgICAgICAgaWYgKHN0YXRlID09PSBTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAvLyBPbmx5IHNldCAnZG93bicgaWYgaXQgaXMgbm90IGFscmVhZHkgaGFuZGxlZFxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5U3RhdGUuZ2V0KGtleSkgIT09IFN0YXRlLkhhbmRsaW5nIHx8IGZvcmNlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVN0YXRlLnNldChrZXksIHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7IiwiaW1wb3J0IHtrZXlib2FyZCwgS2V5fSBmcm9tICcuL2tleWJvYXJkJztcclxuaW1wb3J0IHtldmVudEJ1c30gZnJvbSAnLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudEV2ZW50fSBmcm9tICcuLi9ldmVudC9wbGF5ZXItbW92ZW1lbnQtZXZlbnQnO1xyXG5cclxuY2xhc3MgUGxheWluZ0hhbmRsZXIge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBrZXlib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBpZiAoa2V5Ym9hcmQuaXNEb3duQW5kVW5oYW5kbGVkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Sb3RhdGVDbG9ja3dpc2UsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXlib2FyZC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuTGVmdCwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGtleWJvYXJkLmlzRG93bkFuZFVuaGFuZGxlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuUmlnaHQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXlib2FyZC5pc0Rvd25BbmRVbmhhbmRsZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IFBsYXllck1vdmVtZW50RXZlbnQoUGxheWVyTW92ZW1lbnQuRG93biwgUGxheWVyVHlwZS5IdW1hbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGtleWJvYXJkLmlzRG93bkFuZFVuaGFuZGxlZChLZXkuRHJvcCkpIHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUGxheWVyTW92ZW1lbnRFdmVudChQbGF5ZXJNb3ZlbWVudC5Ecm9wLCBQbGF5ZXJUeXBlLkh1bWFuKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBwbGF5aW5nSGFuZGxlciA9IG5ldyBQbGF5aW5nSGFuZGxlcigpOyIsImltcG9ydCB7Q29sb3J9IGZyb20gJy4vY29sb3InO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGwge1xyXG4gICAgcHJpdmF0ZSBjb2xvcjogQ29sb3I7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IENvbG9yLkVtcHR5O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbG9yKGNvbG9yOiBDb2xvcikge1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3I7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPZmZzZXQgY2FsY3VsYXRlZCBmcm9tIHRvcC1sZWZ0IGNvcm5lciBiZWluZyAwLCAwLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENlbGxPZmZzZXQge1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IFBBTkVMX0NPVU5UX1BFUl9GTE9PUiA9IDEwO1xyXG5leHBvcnQgY29uc3QgVElNRV9VTlRJTF9FVkVSWU9ORV9PTl9TQ1JFRU4gPSAxMDUgKiAxMDAwO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFNQklFTkNFX05JR0hUID0gJ0FNQklFTkNFX05JR0hUJztcclxuZXhwb3J0IGNvbnN0IE1VU0lDX09QRU5JTkcgPSAnTVVTSUNfT1BFTklORyc7XHJcbmV4cG9ydCBjb25zdCBNVVNJQ19NQUlOID0gJ01VU0lDX01BSU4nO1xyXG5leHBvcnQgY29uc3QgTVVTSUNfTUFJTl9WT1ggPSAnTVVTSUNfTUFJTl9WT1gnO1xyXG5leHBvcnQgY29uc3QgU1RVREVOVFNfVEFMS0lORyA9ICdTVFVERU5UU19UQUxLSU5HJztcclxuZXhwb3J0IGNvbnN0IENIRUVSSU5HID0gJ0NIRUVSSU5HJztcclxuZXhwb3J0IGNvbnN0IENMQVBQSU5HID0gJ0NMQVBQSU5HJzsiLCJleHBvcnQgZW51bSBQbGF5ZXJNb3ZlbWVudCB7XHJcbiAgICBOb25lLFxyXG4gICAgTGVmdCxcclxuICAgIFJpZ2h0LFxyXG4gICAgRG93bixcclxuICAgIERyb3AsXHJcbiAgICBSb3RhdGVDbG9ja3dpc2UsXHJcbiAgICBSb3RhdGVDb3VudGVyQ2xvY2t3aXNlXHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1NoYXBlfSBmcm9tICcuLi9tb2RlbC9ib2FyZC9zaGFwZSc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHNoYXBlOiBTaGFwZTtcclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcbiAgICByZWFkb25seSBzdGFydGluZzogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzaGFwZTogU2hhcGUsIHBsYXllclR5cGU6IFBsYXllclR5cGUsIHN0YXJ0aW5nOiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLnN0YXJ0aW5nID0gc3RhcnRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVTaGFwZUVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgcm93SWR4OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSwgcm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5yb3dJZHggPSByb3dJZHg7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9hcmRGaWxsZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENlbGxDaGFuZ2VFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgcmVhZG9ubHkgY2VsbDogQ2VsbDtcclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbGw6IENlbGwsIHJvdzogbnVtYmVyLCBjb2w6IG51bWJlciwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICB0aGlzLnJvdyA9IHJvdztcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5DZWxsQ2hhbmdlRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50VHlwZSxcclxuICAgIEFjdGl2ZVNoYXBlRW5kZWRFdmVudFR5cGUsXHJcbiAgICBCb2FyZEZpbGxlZEV2ZW50VHlwZSxcclxuICAgIENlbGxDaGFuZ2VFdmVudFR5cGUsXHJcbiAgICBGYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLFxyXG4gICAgR2FtZVN0YXRlQ2hhbmdlZFR5cGUsXHJcbiAgICBIcENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBJbnRyb0tleVByZXNzZWRFdmVudFR5cGUsXHJcbiAgICBOcGNGYWNpbmdFdmVudFR5cGUsXHJcbiAgICBOcGNNb3ZlbWVudENoYW5nZWRFdmVudFR5cGUsXHJcbiAgICBOcGNQbGFjZWRFdmVudFR5cGUsXHJcbiAgICBOcGNTdGF0ZUNoYWdlZEV2ZW50VHlwZSxcclxuICAgIE5wY1RlbGVwb3J0ZWRFdmVudFR5cGUsXHJcbiAgICBQbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZSxcclxuICAgIFJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSxcclxuICAgIFJvd3NGaWxsZWRFdmVudFR5cGUsXHJcbiAgICBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RFdmVudCB7XHJcbiAgICBhYnN0cmFjdCBnZXRUeXBlKCk6RXZlbnRUeXBlXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRIYW5kbGVyPFQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50PiB7XHJcbiAgICAoZXZlbnQ6IFQpOnZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJ1cyB7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVyc0J5VHlwZTpNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc0J5VHlwZSA9IG5ldyBNYXA8RXZlbnRUeXBlLCBFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD5bXT4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcih0eXBlOkV2ZW50VHlwZSwgaGFuZGxlcjpFdmVudEhhbmRsZXI8QWJzdHJhY3RFdmVudD4pIHtcclxuICAgICAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogc29tZXRoaW5nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFuZGxlcnM6RXZlbnRIYW5kbGVyPEFic3RyYWN0RXZlbnQ+W10gPSB0aGlzLmhhbmRsZXJzQnlUeXBlLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAoaGFuZGxlcnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBoYW5kbGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzQnlUeXBlLnNldCh0eXBlLCBoYW5kbGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB1bnJlZ2lzdGVyIHRoZSBoYW5kbGVyXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE86IHVucmVnaXN0ZXIoKS4gQW5kIHJlbW92ZSB0aGUgbWFwIGtleSBpZiB6ZXJvIGhhbmRsZXJzIGxlZnQgZm9yIGl0LlxyXG4gICAgXHJcbiAgICAvLyBUT0RPOiBQcmV2ZW50IGluZmluaXRlIGZpcmUoKT9cclxuICAgIGZpcmUoZXZlbnQ6QWJzdHJhY3RFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNCeVR5cGUuZ2V0KGV2ZW50LmdldFR5cGUoKSk7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBoYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGV2ZW50QnVzID0gbmV3IEV2ZW50QnVzKCk7XHJcbmV4cG9ydCBjb25zdCBkZWFkRXZlbnRCdXMgPSBuZXcgRXZlbnRCdXMoKTsgLy8gVXNlZCBieSBBSS5cclxuIiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXJFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuRmFsbGluZ1NlcXVlbmNlckV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZX0gZnJvbSAnLi4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZVN0YXRlQ2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ2FtZVN0YXRlVHlwZTogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBHYW1lU3RhdGVUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmdhbWVTdGF0ZVR5cGUgPSB0eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5HYW1lU3RhdGVDaGFuZ2VkVHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcENoYW5nZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG4gICAgcmVhZG9ubHkgYmxpbmtMb3N0OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwOiBudW1iZXIsIHBsYXllclR5cGU6IFBsYXllclR5cGUsIGJsaW5rTG9zdD1mYWxzZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ocCA9IGhwO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5ibGlua0xvc3QgPSBibGlua0xvc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLkhwQ2hhbmdlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgSW50cm9LZXlQcmVzc2VkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuSW50cm9LZXlQcmVzc2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNGYWNpbmdFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNGYWNpbmdFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbnBjSWQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNQbGFjZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG5cclxuICAgIHJlYWRvbmx5IG5wY0lkOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5OiBudW1iZXJcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihucGNJZDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5ucGNJZCA9IG5wY0lkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBFdmVudFR5cGUuTnBjUGxhY2VkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOcGNUZWxlcG9ydGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5OcGNUZWxlcG9ydGVkRXZlbnRUeXBlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtFdmVudFR5cGUsIEFic3RyYWN0RXZlbnR9IGZyb20gJy4vZXZlbnQtYnVzJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXJNb3ZlbWVudEV2ZW50IGV4dGVuZHMgQWJzdHJhY3RFdmVudCB7XHJcblxyXG4gICAgcmVhZG9ubHkgbW92ZW1lbnQ6IFBsYXllck1vdmVtZW50O1xyXG4gICAgcmVhZG9ubHkgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb3ZlbWVudDogUGxheWVyTW92ZW1lbnQsIHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnQgPSBtb3ZlbWVudDtcclxuICAgICAgICB0aGlzLnBsYXllclR5cGUgPSBwbGF5ZXJUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5QbGF5ZXJNb3ZlbWVudEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCBleHRlbmRzIEFic3RyYWN0RXZlbnQge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RXZlbnRUeXBlLCBBYnN0cmFjdEV2ZW50fSBmcm9tICcuL2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSb3dzRmlsbGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZmlsbGVkUm93SWR4czogbnVtYmVyW107XHJcbiAgICByZWFkb25seSBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGZpbGxlZFJvd0lkeHM6IG51bWJlcltdLCBwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmZpbGxlZFJvd0lkeHMgPSBmaWxsZWRSb3dJZHhzLnNsaWNlKDApO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgQWJzdHJhY3RFdmVudH0gZnJvbSAnLi9ldmVudC1idXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQgZXh0ZW5kcyBBYnN0cmFjdEV2ZW50IHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgejogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5wY0lkOiBudW1iZXIsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5wY0lkID0gbnBjSWQ7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7ZXZlbnRCdXN9IGZyb20gJy4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtHYW1lU3RhdGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4vZXZlbnQvZ2FtZS1zdGF0ZS1jaGFuZ2VkLWV2ZW50JztcclxuXHJcbmV4cG9ydCBjb25zdCBlbnVtIEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdGF0ZSByaWdodCB3aGVuIEphdmFTY3JpcHQgc3RhcnRzIHJ1bm5pbmcuIEluY2x1ZGVzIHByZWxvYWRpbmcuXHJcbiAgICAgKi9cclxuICAgIEluaXRpYWxpemluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFmdGVyIHByZWxvYWQgaXMgY29tcGxldGUgYW5kIGJlZm9yZSBtYWtpbmcgb2JqZWN0IHN0YXJ0KCkgY2FsbHMuXHJcbiAgICAgKi9cclxuICAgIFN0YXJ0aW5nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyBhZnRlciBpbml0aWFsIG9iamVjdHMgc3RhcnQoKSBhbmQgbGlrZWx5IHdoZXJlIHRoZSBnYW1lIGlzIHdhaXRpbmcgb24gdGhlIHBsYXllcidzIGZpcnN0IGlucHV0LlxyXG4gICAgICovXHJcbiAgICBJbnRybyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgaXMgdGhlIG1haW4gZ2FtZSBsb29wIG9mIGNvbnRyb2xsaW5nIHBpZWNlcy5cclxuICAgICAqL1xyXG4gICAgUGxheWluZyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBvZiBnYW1lLCBzY29yZSBpcyBzaG93aW5nLCBub3RoaW5nIGxlZnQgdG8gZG8uXHJcbiAgICAgKi9cclxuICAgIEVuZGVkXHJcbn1cclxuXHJcbmNsYXNzIEdhbWVTdGF0ZSB7XHJcbiAgICBwcml2YXRlIGN1cnJlbnQ6IEdhbWVTdGF0ZVR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmc7IC8vIERlZmF1bHQgc3RhdGUuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudCgpOiBHYW1lU3RhdGVUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnQoY3VycmVudDogR2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnQ7XHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgR2FtZVN0YXRlQ2hhbmdlZEV2ZW50KGN1cnJlbnQpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZSgpOyIsImltcG9ydCB7cHJlbG9hZGVyfSBmcm9tICcuL3ByZWxvYWRlcic7XHJcbmltcG9ydCB7bW9kZWx9IGZyb20gJy4vbW9kZWwvbW9kZWwnO1xyXG5pbXBvcnQge3ZpZXd9IGZyb20gJy4vdmlldy92aWV3JztcclxuaW1wb3J0IHtjb250cm9sbGVyfSBmcm9tICcuL2NvbnRyb2xsZXIvY29udHJvbGxlcic7XHJcbmltcG9ydCB7c291bmRNYW5hZ2VyfSBmcm9tICcuL3NvdW5kL3NvdW5kLW1hbmFnZXInO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi9nYW1lLXN0YXRlJztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5Jbml0aWFsaXppbmcpO1xyXG4gICAgc291bmRNYW5hZ2VyLmF0dGFjaCgpO1xyXG4gICAgcHJlbG9hZGVyLnByZWxvYWQoKCkgPT4ge1xyXG4gICAgICAgIG1haW4oKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIG1haW4oKSB7XHJcblxyXG4gICAgLy8gU3RhcnR1cCBpbiByZXZlcnNlIE1WQyBvcmRlciB0byBlbnN1cmUgdGhhdCBldmVudCBidXMgaGFuZGxlcnMgaW4gdGhlXHJcbiAgICAvLyBjb250cm9sbGVyIGFuZCB2aWV3IHJlY2VpdmUgKGFueSkgc3RhcnQgZXZlbnRzIGZyb20gbW9kZWwuc3RhcnQoKS5cclxuICAgIHNvdW5kTWFuYWdlci5zdGFydCgpO1xyXG4gICAgY29udHJvbGxlci5zdGFydCgpO1xyXG4gICAgdmlldy5zdGFydCgpO1xyXG4gICAgbW9kZWwuc3RhcnQoKTtcclxuICAgIFxyXG4gICAgZ2FtZVN0YXRlLnNldEN1cnJlbnQoR2FtZVN0YXRlVHlwZS5JbnRybyk7XHJcblxyXG4gICAgbGV0IHN0ZXAgPSAoKSA9PiB7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xyXG5cclxuICAgICAgICBsZXQgZWxhcHNlZCA9IGNhbGN1bGF0ZUVsYXBzZWQoKTtcclxuICAgICAgICBjb250cm9sbGVyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdmlldy5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIG1vZGVsLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgc291bmRNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9O1xyXG4gICAgc3RlcCgpO1xyXG59XHJcblxyXG5sZXQgbGFzdFN0ZXAgPSBEYXRlLm5vdygpO1xyXG5mdW5jdGlvbiBjYWxjdWxhdGVFbGFwc2VkKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIGxhc3RTdGVwO1xyXG4gICAgaWYgKGVsYXBzZWQgPiAxMDApIHtcclxuICAgICAgICBlbGFwc2VkID0gMTAwOyAvLyBlbmZvcmNlIHNwZWVkIGxpbWl0XHJcbiAgICB9XHJcbiAgICBsYXN0U3RlcCA9IG5vdztcclxuICAgIHJldHVybiBlbGFwc2VkO1xyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi4vYm9hcmQvc2hhcGUnO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7Q2VsbH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUVuZGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnR9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItbW92ZW1lbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuaW1wb3J0IHtNQVhfSFAsIHZpdGFsc30gZnJvbSAnLi4vdml0YWxzJztcclxuXHJcbmNvbnN0IE1BWF9DT0xTID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG5cclxuLyoqXHJcbiAqIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIG1hbmlwdWxhdGluZyBhIHNoYXBlIHRoYXQgaGFzIGp1c3QgY29tZSBpbnRvIHBsYXkuXHJcbiAqL1xyXG5jb25zdCBUSU1FX0RFTEFZID0gNTAwO1xyXG5cclxuLyoqXHJcbiAqIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIG1hbmlwdWxhdGluZyB0aGUgc2hhcGUgdGhhdCBpcyBpbiBwbGF5LlxyXG4gKi9cclxuY29uc3QgVElNRV9CRVRXRUVOX01PVkVTID0gMjAwO1xyXG5cclxuLy8gVGhlc2UgY29uc3RhbnRzIGFyZSBmb3IgdGltaW5nIGhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIGRyb3BwaW5nIHNoYXBlLCBzaW5jZSB0aGUgc3RhcnQgb2YgdGhlIHNoYXBlLlxyXG5jb25zdCBUSU1FX0ZBU1RFU1RfVElMTF9EUk9QID0gMjg1MDtcclxuY29uc3QgVElNRV9TTE9XRVNUX1RJTExfRFJPUCA9IDQ4NTA7XHJcbmNvbnN0IFJBTkdFX1RJTUVfVElMTF9EUk9QID0gVElNRV9TTE9XRVNUX1RJTExfRFJPUCAtIFRJTUVfRkFTVEVTVF9USUxMX0RST1A7XHJcblxyXG4vKipcclxuICogQWRkcyBzb21lIHZhcmlhdGlvbiB0byBUSU1FX0JFVFdFRU5fTU9WRVNcclxuICovXHJcbmNvbnN0IFRJTUVfTUFYX0FERElUSU9OQUxfVElNRV9CRVRXRUVOX01PVkVTID0gMTAwO1xyXG5cclxuaW50ZXJmYWNlIFpvbWJpZUJvYXJkIHtcclxuICAgIC8vIFdheXMgdG8gaW50ZXJhY3Qgd2l0aCBpdC5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbjtcclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW47XHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk6IHZvaWQ7XHJcbiAgICBtb3ZlVG9Ub3AoKTogdm9pZDtcclxuICAgIHJvdGF0ZVNoYXBlQ2xvY2t3aXNlKCk6IGJvb2xlYW47XHJcbiAgICBjb252ZXJ0U2hhcGVUb0NlbGxzKCk6IHZvaWQ7XHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpOiB2b2lkO1xyXG5cclxuICAgIC8vIFdheXMgdG8gZGVyaXZlIGluZm9ybWF0aW9uIGZyb20gaXQuXHJcbiAgICBnZXRDdXJyZW50U2hhcGVDb2xJZHgoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlcjtcclxuICAgIGNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlSG9sZXMoKTogbnVtYmVyO1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJlYWxCb2FyZCBleHRlbmRzIFpvbWJpZUJvYXJkIHtcclxuICAgIGNsb25lWm9tYmllKCk6IFpvbWJpZUJvYXJkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQWkge1xyXG5cclxuICAgIHByaXZhdGUgcmVhbEJvYXJkOiBSZWFsQm9hcmQ7XHJcbiAgICBwcml2YXRlIHRpbWVVbnRpbE5leHRNb3ZlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGRlbGF5VHRsOiBudW1iZXI7XHJcblxyXG4gICAgLy8gSG93IGxvbmcgdGhlIGN1cnJlbnQgc2hhcGUgc2hvdWxkIGxhc3QsIGlmIHBvc3NpYmxlLCB0aWxsIEFJIGhpdHMgdGhlIHNwYWNlIGJhci5cclxuICAgIHByaXZhdGUgdGltZVRpbGxEcm9wOiBudW1iZXI7XHJcblxyXG4gICAgLy8gMCA9IG5vIHJvdGF0aW9uLCAxID0gb25lIHJvdGF0aW9uLCAyID0gdHdvIHJvdGF0aW9ucywgMyA9IHRocmVlIHJvdGF0aW9ucy5cclxuICAgIHByaXZhdGUgdGFyZ2V0Um90YXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHRhcmdldENvbElkeDogbnVtYmVyO1xyXG4gICAgLy8gUHJldmVudCBBSSBmcm9tIGRvaW5nIGFueXRoaW5nIHdoaWxlIHRoZSBwaWVjZSBpcyB3YWl0aW5nIHRvIFwibG9ja1wiIGludG8gdGhlIG1hdHJpeC5cclxuICAgIHByaXZhdGUgbW92ZUNvbXBsZXRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFsQm9hcmQ6IFJlYWxCb2FyZCkge1xyXG4gICAgICAgIHRoaXMucmVhbEJvYXJkID0gcmVhbEJvYXJkO1xyXG4gICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSB0aGlzLmNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kZWxheVR0bCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMudGltZVRpbGxEcm9wID0gVElNRV9TTE9XRVNUX1RJTExfRFJPUDtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0Q29sSWR4ID0gMDtcclxuICAgICAgICB0aGlzLm1vdmVDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy50aW1lVGlsbERyb3AgLT0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVsYXlUdGwgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsYXlUdGwgLT0gZWxhcHNlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVVbnRpbE5leHRNb3ZlIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVVbnRpbE5leHRNb3ZlIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGltZVVudGlsTmV4dE1vdmUgPSB0aGlzLmNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkdmFuY2VUb3dhcmRzVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBwcm92aWRlcyBhIGhpZ2gtbGV2ZWwgdmlldyBvZiB0aGUgQUkncyB0aG91Z2h0IHByb2Nlc3MuXHJcbiAgICAgKi9cclxuICAgIHN0cmF0ZWdpemUoKSB7XHJcbiAgICAgICAgLy8gUGFydCAxIC0gRGV0ZXJtaW5lIGhvdyBsb25nIHRoaXMgbW92ZSBzaG91bGQgYmUsIGJhc2VkIG9uIGN1cnJlbnQgc2NvcmUuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBIaWdoZXIgbWVhbnMgaHVtYW4gaXMgd2lubmluZy5cclxuICAgICAgICAgICAgbGV0IGRpZmYgPSB2aXRhbHMuaHVtYW5IaXRQb2ludHMgLSB2aXRhbHMuYWlIaXRQb2ludHM7XHJcbiAgICAgICAgICAgIGxldCBwY3QgPSAoTUFYX0hQIC0gZGlmZikgLyAoTUFYX0hQICogMik7IFxyXG4gICAgICAgICAgICB0aGlzLnRpbWVUaWxsRHJvcCA9IFRJTUVfRkFTVEVTVF9USUxMX0RST1AgKyAocGN0ICogUkFOR0VfVElNRV9USUxMX0RST1ApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGFydCAyIC0gRGV0ZXJtaW5lIGhvdyB0byBmaXQgdGhlIGdpdmVuIHNoYXBlLlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHpvbWJpZSA9IHRoaXMucmVhbEJvYXJkLmNsb25lWm9tYmllKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIHBvc3NpYmxlIHJvdGF0aW9ucyBhbmQgY29sdW1uc1xyXG4gICAgICAgICAgICBsZXQgYmVzdEZpdG5lc3MgPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcclxuICAgICAgICAgICAgbGV0IGJlc3RSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIGxldCBiZXN0Q29sSWR4ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm90YXRpb24gPSAwOyByb3RhdGlvbiA8IDQ7IHJvdGF0aW9uKyspIHtcclxuICAgICAgICAgICAgICAgIHdoaWxlKHpvbWJpZS5tb3ZlU2hhcGVMZWZ0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IE1BWF9DT0xTOyBpZHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHpvbWJpZS5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgem9tYmllLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpdG5lc3MgPSB0aGlzLmNhbGN1bGF0ZUZpdG5lc3Moem9tYmllKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZml0bmVzcyA+IGJlc3RGaXRuZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RGaXRuZXNzID0gZml0bmVzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdFJvdGF0aW9uID0gcm90YXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RDb2xJZHggPSB6b21iaWUuZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk7IC8vIFVzZSB0aGlzIHJhdGhlciB0aGFuIGlkeCBpbiBjYXNlIGl0IHdhcyBvZmYgYmVjYXVzZSBvZiB3aGF0ZXZlciByZWFzb24gKG9ic3RydWN0aW9uLCB3YWxsLCBldGMuLi4pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB6b21iaWUudW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB6b21iaWUubW92ZVRvVG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNhbk1vdmVSaWdodCA9IHpvbWJpZS5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYW5Nb3ZlUmlnaHQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHpvbWJpZS5yb3RhdGVTaGFwZUNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBGaW5hbGx5LCBzZXQgdGhlIHZhbHVlcyB0aGF0IHdpbGwgbGV0IHRoZSBBSSBhZHZhbmNlIHRvd2FyZHMgdGhlIHRhcmdldC5cclxuICAgICAgICAgICAgdGhpcy50YXJnZXRSb3RhdGlvbiA9IGJlc3RSb3RhdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldENvbElkeCA9IGJlc3RDb2xJZHg7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KGV2ZW50OiBBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5wbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkFpKSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5zdGFydGluZyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxheVR0bCA9IFRJTUVfREVMQVk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEbyBub3QgbmVlZCB0byByZWFjdCB0byBodW1hbidzIHNoYXBlIG1vdmVtZW50cy5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlZCBvbiBodHRwczovL2NvZGVteXJvYWQud29yZHByZXNzLmNvbS8yMDEzLzA0LzE0L3RldHJpcy1haS10aGUtbmVhci1wZXJmZWN0LXBsYXllci9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVGaXRuZXNzKHpvbWJpZTogWm9tYmllQm9hcmQpIHtcclxuICAgICAgICBsZXQgYWdncmVnYXRlSGVpZ2h0ID0gem9tYmllLmNhbGN1bGF0ZUFnZ3JlZ2F0ZUhlaWdodCgpO1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gem9tYmllLmNhbGN1bGF0ZUNvbXBsZXRlTGluZXMoKTtcclxuICAgICAgICBsZXQgaG9sZXMgPSB6b21iaWUuY2FsY3VsYXRlSG9sZXMoKTtcclxuICAgICAgICBsZXQgYnVtcGluZXNzID0gem9tYmllLmNhbGN1bGF0ZUJ1bXBpbmVzcygpO1xyXG4gICAgICAgIGxldCBmaXRuZXNzID0gKC0wLjUxMDA2NiAqIGFnZ3JlZ2F0ZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICArICggMC43NjA2NjYgKiBjb21wbGV0ZUxpbmVzKVxyXG4gICAgICAgICAgICAgICAgICAgICsgKC0wLjM1NjYzICAqIGhvbGVzKVxyXG4gICAgICAgICAgICAgICAgICAgICsgKC0wLjE4NDQ4MyAqIGJ1bXBpbmVzcyk7XHJcbiAgICAgICAgcmV0dXJuIGZpdG5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZHZhbmNlVG93YXJkc1RhcmdldCgpIHtcclxuICAgICAgICBpZiAodGhpcy5tb3ZlQ29tcGxldGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvbiA9PT0gdGhpcy50YXJnZXRSb3RhdGlvbiAmJiB0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA9PT0gdGhpcy50YXJnZXRDb2xJZHgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVRpbGxEcm9wIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLm1vdmVTaGFwZURvd25BbGxUaGVXYXkoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Q29sSWR4ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZUNvbXBsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTdGlsbCBoYXZlIHRpbWUgdG8gd2FpdCBiZWZvcmUgZHJvcHBpbmcgdGhlIHNoYXBlLlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uIDwgdGhpcy50YXJnZXRSb3RhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsQm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWxCb2FyZC5nZXRDdXJyZW50U2hhcGVDb2xJZHgoKSA8IHRoaXMudGFyZ2V0Q29sSWR4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxCb2FyZC5tb3ZlU2hhcGVSaWdodCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVhbEJvYXJkLmdldEN1cnJlbnRTaGFwZUNvbElkeCgpID4gdGhpcy50YXJnZXRDb2xJZHgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbEJvYXJkLm1vdmVTaGFwZUxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVRpbWVVbnRpbE5leHRNb3ZlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoVElNRV9CRVRXRUVOX01PVkVTICsgKE1hdGgucmFuZG9tKCkgKiBUSU1FX01BWF9BRERJVElPTkFMX1RJTUVfQkVUV0VFTl9NT1ZFUykpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q2VsbH0gZnJvbSAnLi4vLi4vZG9tYWluL2NlbGwnO1xyXG5pbXBvcnQge0NvbG9yfSBmcm9tICcuLi8uLi9kb21haW4vY29sb3InO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uLy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi8uLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtTaGFwZUZhY3RvcnksIGRlYWRTaGFwZUZhY3Rvcnl9IGZyb20gJy4vc2hhcGUtZmFjdG9yeSc7XHJcbmltcG9ydCB7RXZlbnRCdXMsIGRlYWRFdmVudEJ1c30gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtDZWxsQ2hhbmdlRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2NlbGwtY2hhbmdlLWV2ZW50JztcclxuaW1wb3J0IHtSb3dzRmlsbGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge0FjdGl2ZVNoYXBlRW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtCb2FyZEZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ib2FyZC1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge3dpbn0gZnJvbSAnLi93aW4nO1xyXG5cclxuY29uc3QgTUFYX1JPV1MgPSAxOTsgLy8gVG9wIDIgcm93cyBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuIEFsc28sIHNlZSBsaWdodGluZy1ncmlkLnRzLlxyXG5jb25zdCBNQVhfQ09MUyA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuY29uc3QgVEVNUF9ERUxBWV9NUyA9IDUwMDtcclxuXHJcbmNvbnN0IGVudW0gQm9hcmRTdGF0ZSB7XHJcbiAgICBQYXVzZWQsXHJcbiAgICBJblBsYXksXHJcbiAgICBXaW4sXHJcbiAgICBMb3NlXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCb2FyZCB7XHJcbiAgICBwcml2YXRlIHBsYXllclR5cGU6IFBsYXllclR5cGU7XHJcbiAgICBwcml2YXRlIHNoYXBlRmFjdG9yeTogU2hhcGVGYWN0b3J5O1xyXG4gICAgcHJpdmF0ZSBldmVudEJ1czogRXZlbnRCdXM7XHJcblxyXG4gICAgcHJpdmF0ZSBib2FyZFN0YXRlOiBCb2FyZFN0YXRlO1xyXG4gICAgcHJpdmF0ZSBtc1RpbGxHcmF2aXR5VGljazogbnVtYmVyO1xyXG5cclxuICAgIGN1cnJlbnRTaGFwZTogU2hhcGU7XHJcbiAgICByZWFkb25seSBtYXRyaXg6IENlbGxbXVtdO1xyXG5cclxuICAgIHByaXZhdGUganVua1Jvd0hvbGVDb2x1bW46IG51bWJlcjtcclxuICAgIHByaXZhdGUganVua1Jvd0hvbGVEaXJlY3Rpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUganVua1Jvd0NvbG9yMTogQ29sb3I7XHJcbiAgICBwcml2YXRlIGp1bmtSb3dDb2xvcjI6IENvbG9yO1xyXG4gICAgcHJpdmF0ZSBqdW5rUm93Q29sb3JJZHg6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGVuZGVkU3RlcEVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW5kZWRPZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJUeXBlOiBQbGF5ZXJUeXBlLCBzaGFwZUZhY3Rvcnk6IFNoYXBlRmFjdG9yeSwgZXZlbnRCdXM6IEV2ZW50QnVzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUeXBlID0gcGxheWVyVHlwZTtcclxuICAgICAgICB0aGlzLnNoYXBlRmFjdG9yeSA9IHNoYXBlRmFjdG9yeTtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzID0gZXZlbnRCdXM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkO1xyXG4gICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPSBURU1QX0RFTEFZX01TO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tYXRyaXggPSBbXTtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBNQVhfUk9XUzsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbcm93SWR4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W3Jvd0lkeF1bY29sSWR4XSA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPSBNQVhfQ09MUyAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9yMSA9IENvbG9yLldoaXRlO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9yMiA9IENvbG9yLldoaXRlO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0NvbG9ySWR4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5lbmRlZFN0ZXBFbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLmVuZGVkT2Zmc2V0ID0gTUFYX1JPV1MgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0QW5kUGxheShwbGF5PXRydWUpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTaGFwZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGdpdmVzIGEgaGlnaCBsZXZlbCB2aWV3IG9mIHRoZSBtYWluIGdhbWUgbG9vcC5cclxuICAgICAqIFRoaXMgc2hvdWxkbid0IGJlIGNhbGxlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5QYXVzZWQpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBoZXJlIGp1c3QgdG8gZW5zdXJlIHRoYXQgdGhlIG1ldGhvZCB0byBydW5zIGltbWVkaWF0ZWx5IGFmdGVyIHVucGF1c2luZy5cclxuICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgLT0gZWxhcHNlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMubXNUaWxsR3Jhdml0eVRpY2sgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tc1RpbGxHcmF2aXR5VGljayA9IFRFTVBfREVMQVlfTVM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50cnlHcmF2aXR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVTaGFwZURvd24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5XaW4pIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVFbmRlZChlbGFwc2VkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5Mb3NlKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGhpbmdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsIHRoaXMgb25jZSBhIHNoYXBlIGlzIGtub3duIHRvIGJlIGluIGl0cyBmaW5hbCByZXN0aW5nIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVFbmRPZkN1cnJlbnRQaWVjZVRhc2tzKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRCdXMuZmlyZShuZXcgQWN0aXZlU2hhcGVFbmRlZEV2ZW50KHRoaXMucGxheWVyVHlwZSwgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCkpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvbnZlcnRTaGFwZVRvQ2VsbHMoKTtcclxuICAgICAgICBpZiAodGhpcy5oYW5kbGVGdWxsQm9hcmQoKSkge1xyXG4gICAgICAgICAgICAvLyBCb2FyZCBpcyBmdWxsIC0tIHN0YXJ0aW5nIGEgbmV3IHNoYXBlIHdhcyBkZWxlZ2F0ZWQgdG8gbGF0ZXIgYnkgaGFuZGxlRnVsbEJvYXJkKCkuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGVyZSB3ZXJlIGZpbGxlZCBsaW5lcyAtLSBzdGFydGluZyBhIG5ldyBzaGFwZSB3YXMgZGVsZWdhdGVkIHRvIGxhdGVyIGJ5IGhhbmRsZUFueUZpbGxlZExpbmVzUGFydDEoKS5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRTaGFwZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgZ2V0Q3VycmVudFNoYXBlQ29sSWR4KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZUxlZnQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZUxlZnQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVTaGFwZVJpZ2h0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlTGVmdCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdGUgPT09IEJvYXJkU3RhdGUuSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVEb3duKCk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCF0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkpOyAvLyBUT0RPOiBBZGQgdXBwZXIgYm91bmQuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSB0aGUgQUkuXHJcbiAgICAgKi9cclxuICAgIG1vdmVUb1RvcCgpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5tb3ZlVG9Ub3AoKTsgXHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlU2hhcGVDbG9ja3dpc2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0ZSA9PT0gQm9hcmRTdGF0ZS5JblBsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ2xvY2t3aXNlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmppZ2dsZVJvdGF0ZWRTaGFwZUFyb3VuZCgpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUucm90YXRlQ291bnRlckNsb2Nrd2lzZSgpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZVJhbmRvbVdoaXRlQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfUk9XUyk7XHJcbiAgICAgICAgICAgIGxldCBjb2xJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfQ09MUyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCBDb2xvci5XaGl0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgYSBjZWxsIHdhcyBmb3VuZCBhbmQgY2xlYXJlZC5cclxuICAgICAqIFJldHVybiBmYWxzZSBpZiBub25lIHdhcyBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgY2xlYXJPbmVXaGl0ZUNlbGwoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dbY29sSWR4XS5nZXRDb2xvcigpID09PSBDb2xvci5XaGl0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJvd0lkeCwgY29sSWR4LCBDb2xvci5FbXB0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5V2luKCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuV2luO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXlMb3NlKCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuTG9zZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUVuZGVkKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZW5kZWRTdGVwRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLmVuZGVkU3RlcEVsYXBzZWQgPiAyNTAgJiYgdGhpcy5lbmRlZE9mZnNldCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5lbmRlZFN0ZXBFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgdGhpcy5lbmRlZE9mZnNldCAtPSAxO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbGF0aXZlUm93SWR4ID0gcm93SWR4ICsgdGhpcy5lbmRlZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIGlmIChyZWxhdGl2ZVJvd0lkeCA+IE1BWF9ST1dTIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luLmhhc0NlbGwocm93SWR4LCBjb2xJZHgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2VsbENvbG9yKHJlbGF0aXZlUm93SWR4LCBjb2xJZHgsIENvbG9yLldoaXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgYWJsZSB0byBzdWNjZXNzZnVsbHkgcm90YXRlIHRoZSBzaGFwZSBhbG9uZ3NpZGUgYW55dGhpbmcsIGlmIGFueS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBqaWdnbGVSb3RhdGVkU2hhcGVBcm91bmQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICBsZXQgb3JpZ2luYWxSb3cgPSB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICBsZXQgb3JpZ2luYWxDb2wgPSB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29sbGlzaW9uRGV0ZWN0ZWQoKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIERpZG4ndCBuZWVkIHRvIGRvIGFueSBqaWdnbGluZyBhdCBhbGwuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSmlnZ2xlIGl0IGxlZnQuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3RpbGwgdW5zdWNjZXNzZnVsLCBqaWdnbGUgaXQgcmlnaHQuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzdGlsbCB1bnN1Y2Nlc3NmdWwsIG1vdmUgaXQgdXAsIHVwIHRvIDQgdGltZXMuXHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5kb1VwVG9UaHJlZVRpbWVzKG9yaWdpbmFsUm93LCBvcmlnaW5hbENvbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgamlnZ2xlUm90YXRlZFNoYXBlQXJvdW5kKCkuXHJcbiAgICAgKiBcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgc2hhcGUgdG8gdGhlIGdpdmVuIG9yaWdpbmFsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogVGhlbiwgcnVucyB0aGUgZ2l2ZW4gbGFtYmRhIGEgZmV3IHRpbWVzIHRvIHNlZSBpZiBhbnkgcHJvZHVjZSBhIG5vbi1jb2xsaXNpb24gc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZG9VcFRvVGhyZWVUaW1lcyhvcmlnaW5hbFJvdzogbnVtYmVyLCBvcmlnaW5hbENvbDogbnVtYmVyLCB0aGluZzogKCkgPT4gdm9pZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLnNldFJvdyhvcmlnaW5hbFJvdyk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuc2V0Q29sKG9yaWdpbmFsQ29sKTtcclxuXHJcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgMzsgY291bnQrKykge1xyXG4gICAgICAgICAgICB0aGluZygpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRKdW5rUm93cyhudW1iZXJPZlJvd3NUb0FkZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgcm93cyBhdCB0aGUgdG9wIHRvIG1ha2Ugcm9vbSBhdCB0aGUgYm90dG9tLlxyXG4gICAgICAgIHRoaXMubWF0cml4LnNwbGljZSgwLCBudW1iZXJPZlJvd3NUb0FkZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBqdW5rIHJvd3MgYXQgdGhlIGJvdHRvbS5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1iZXJPZlJvd3NUb0FkZDsgaWR4KyspIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSByb3cgdG8gY29tcGxldGVseSBmaWxsZWQuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuZ2V0TmV4dEp1bmtSb3dDb2xvcigpO1xyXG4gICAgICAgICAgICBsZXQgcm93OiBDZWxsW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IG5ldyBDZWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldENvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQdW5jaCBhIGhvbGUgaW4gdGhlIGxpbmUuXHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gcm93W3RoaXMuanVua1Jvd0hvbGVDb2x1bW5dO1xyXG4gICAgICAgICAgICBjZWxsLnNldENvbG9yKENvbG9yLkVtcHR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZm9yIHRoZSBuZXh0IGp1bmsgcm93IGxpbmUuXHJcbiAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gKz0gdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVua1Jvd0hvbGVDb2x1bW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanVua1Jvd0hvbGVEaXJlY3Rpb24gKj0gLTE7IC8vIEZsaXBzIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID49IE1BWF9DT0xTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bmtSb3dIb2xlQ29sdW1uID0gTUFYX0NPTFMgLSAyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5qdW5rUm93SG9sZURpcmVjdGlvbiAqPSAtMTsgLy8gRmxpcHMgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeC5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdGlmeSBmb3IgYWxsIGNlbGxzIGJlY2F1c2UgZW50aXJlIGJvYXJkIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdG8gb3duIG1ldGhvZD9cclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCB0aGlzLm1hdHJpeC5sZW5ndGg7IHJvd0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLm1hdHJpeFtyb3dJZHhdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCByb3cubGVuZ3RoOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IENlbGxDaGFuZ2VFdmVudChjZWxsLCByb3dJZHgsIGNvbElkeCwgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgYWN0aXZlIHNoYXBlIGZyb20gZ2V0dGluZyBidXJpZWQgaW4gYXMgbWFueSBhcyA0IHJvd3MuXHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpID4gMCAmJiB0aGlzLmNvbGxpc2lvbkRldGVjdGVkKCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZlcnkgaGFja3kgbWV0aG9kIGp1c3Qgc28gdGhlIEFJIGhhcyBhIHRlbXAgY29weSBvZiB0aGUgYm9hcmQgdG8gZXhwZXJpbWVudCB3aXRoLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVpvbWJpZSgpOiBCb2FyZCB7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgQm9hcmQodGhpcy5wbGF5ZXJUeXBlLCBkZWFkU2hhcGVGYWN0b3J5LCBkZWFkRXZlbnRCdXMpO1xyXG5cclxuICAgICAgICAvLyBBbGxvdyB0aGUgQUkgdG8gbW92ZSBhbmQgcm90YXRlIHRoZSBjdXJyZW50IHNoYXBlXHJcbiAgICAgICAgY29weS5ib2FyZFN0YXRlID0gQm9hcmRTdGF0ZS5JblBsYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29weSB0aGUgY3VycmVudCBzaGFwZSBhbmQgdGhlIG1hdHJpeC4gU2hvdWxkbid0IG5lZWQgYW55dGhpbmcgZWxzZS5cclxuICAgICAgICBjb3B5LmN1cnJlbnRTaGFwZSA9IHRoaXMuY3VycmVudFNoYXBlLmNsb25lU2ltcGxlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGNvcHkubWF0cml4W3Jvd0lkeF1bY29sSWR4XS5zZXRDb2xvcihyb3dbY29sSWR4XS5nZXRDb2xvcigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvcHk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQWdncmVnYXRlSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICByZXR1cm4gY29sSGVpZ2h0cy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgKyBiOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEZhbGxpbmdTZXF1ZW5jZXIuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0cyA9IHRoaXMuY2FsY3VsYXRlQ29sdW1uSGVpZ2h0cygpO1xyXG4gICAgICAgIHJldHVybiBjb2xIZWlnaHRzLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSA+IGIgPyBhIDogYjsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29tcGxldGVMaW5lcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjb21wbGV0ZUxpbmVzID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3dbY29sSWR4XS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvdW50ID49IHJvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlTGluZXMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlTGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqIERldGVybWluZXMgaG9sZXMgYnkgc2Nhbm5pbmcgZWFjaCBjb2x1bW4sIGhpZ2hlc3QgZmxvb3IgdG8gbG93ZXN0IGZsb29yLCBhbmRcclxuICAgICAqIHNlZWluZyBob3cgbWFueSB0aW1lcyBpdCBzd2l0Y2hlcyBmcm9tIGNvbG9yZWQgdG8gZW1wdHkgKGJ1dCBub3QgdGhlIG90aGVyIHdheSBhcm91bmQpLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVIb2xlcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3RhbEhvbGVzID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IGhvbGVzID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDZWxsV2FzRW1wdHkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZXMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ2VsbFdhc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NlbGxXYXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDZWxsV2FzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG90YWxIb2xlcyArPSBob2xlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvdGFsSG9sZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQnVtcGluZXNzKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGJ1bXBpbmVzcyA9IDA7XHJcbiAgICAgICAgbGV0IGNvbEhlaWdodHMgPSB0aGlzLmNhbGN1bGF0ZUNvbHVtbkhlaWdodHMoKTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBjb2xIZWlnaHRzLmxlbmd0aCAtIDI7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwxID0gY29sSGVpZ2h0c1tpZHhdO1xyXG4gICAgICAgICAgICBsZXQgdmFsMiA9IGNvbEhlaWdodHNbaWR4ICsgMV07XHJcbiAgICAgICAgICAgIGJ1bXBpbmVzcyArPSBNYXRoLmFicyh2YWwxIC0gdmFsMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW1waW5lc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDb2x1bW5IZWlnaHRzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgY29sSGVpZ2h0czogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgY29sSGVpZ2h0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgTUFYX0NPTFM7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdoZXN0ID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gTUFYX1JPV1MgLSAxOyByb3dJZHggPj0gMDsgcm93SWR4LS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoZXN0ID0gTUFYX1JPV1MgLSByb3dJZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sSGVpZ2h0c1tjb2xJZHhdID0gaGlnaGVzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbEhlaWdodHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb25seSByZWFzb24gdGhpcyBpcyBub3QgcHJpdmF0ZSBpcyBzbyB0aGUgQUkgY2FuIGV4cGVyaW1lbnQgd2l0aCBpdC5cclxuICAgICAqIFdvcmsgaGVyZSBzaG91bGQgYWJsZSB0byBiZSBiZSB1bmRvbmUgYnkgdW5kb0NvbnZlcnRTaGFwZVRvQ2VsbHMuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnRTaGFwZVRvQ2VsbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0IG9mIHRoaXMuY3VycmVudFNoYXBlLmdldE9mZnNldHMoKSkge1xyXG4gICAgICAgICAgICBsZXQgcm93SWR4ID0gb2Zmc2V0LnkgKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRSb3coKTtcclxuICAgICAgICAgICAgbGV0IGNvbElkeCA9IG9mZnNldC54ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Q29sKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm93SWR4IDwgMCB8fCByb3dJZHggPj0gdGhpcy5tYXRyaXgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IDAgfHwgY29sSWR4ID49IHRoaXMubWF0cml4W3Jvd0lkeF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VDZWxsQ29sb3Iocm93SWR4LCBjb2xJZHgsIHRoaXMuY3VycmVudFNoYXBlLmNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGJ5IHRoZSBBSS4gU2hvdWxkIHVuZG8gY29udmVydFNoYXBlVG9DZWxscygpLlxyXG4gICAgICovXHJcbiAgICB1bmRvQ29udmVydFNoYXBlVG9DZWxscygpIHtcclxuICAgICAgICBmb3IgKGxldCBvZmZzZXQgb2YgdGhpcy5jdXJyZW50U2hhcGUuZ2V0T2Zmc2V0cygpKSB7XHJcbiAgICAgICAgICAgIGxldCByb3dJZHggPSBvZmZzZXQueSArIHRoaXMuY3VycmVudFNoYXBlLmdldFJvdygpO1xyXG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gb2Zmc2V0LnggKyB0aGlzLmN1cnJlbnRTaGFwZS5nZXRDb2woKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3dJZHggPCAwIHx8IHJvd0lkeCA+PSB0aGlzLm1hdHJpeC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgMCB8fCBjb2xJZHggPj0gdGhpcy5tYXRyaXhbcm93SWR4XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IHRoaXMubWF0cml4Lmxlbmd0aDsgcm93SWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IHRoaXMubWF0cml4W3Jvd0lkeF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IHJvdy5sZW5ndGg7IGNvbElkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNlbGxDb2xvcihyb3dJZHgsIGNvbElkeCwgQ29sb3IuRW1wdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBbdGhpcy5qdW5rUm93Q29sb3IxLCB0aGlzLmp1bmtSb3dDb2xvcjJdID0gdGhpcy5nZXRSYW5kb21Db2xvcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBtZXRob2QgdG8gY2hhbmdlIGEgc2luZ2xlIGNlbGwgY29sb3IncyBhbmQgbm90aWZ5IHN1YnNjcmliZXJzIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hhbmdlQ2VsbENvbG9yKHJvd0lkeDogbnVtYmVyLCBjb2xJZHg6IG51bWJlciwgY29sb3I6IENvbG9yKSB7XHJcbiAgICAgICAgLy8gVE9ETzogTWF5YmUgYm91bmRzIGNoZWNrIGhlcmUuXHJcbiAgICAgICAgbGV0IGNlbGwgPSB0aGlzLm1hdHJpeFtyb3dJZHhdW2NvbElkeF07XHJcbiAgICAgICAgY2VsbC5zZXRDb2xvcihjb2xvcik7XHJcbiAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRTaGFwZShmb3JjZUJhZ1JlZmlsbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlID0gdGhpcy5zaGFwZUZhY3RvcnkubmV4dFNoYXBlKGZvcmNlQmFnUmVmaWxsKTtcclxuICAgICAgICB0aGlzLmZpcmVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyeUdyYXZpdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGNhbk1vdmVEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUubW92ZURvd24oKTtcclxuICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25EZXRlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIGNhbk1vdmVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlLm1vdmVVcCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2FuTW92ZURvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlbmRlZCBmb3IgY2hlY2tpbmcgb2YgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnRcclxuICAgICAqIHNoYXBlIGhhcyBhbnkgb3ZlcmxhcCB3aXRoIGV4aXN0aW5nIGNlbGxzIHRoYXQgaGF2ZSBjb2xvci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb2xsaXNpb25EZXRlY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiB0aGlzLmN1cnJlbnRTaGFwZS5nZXRPZmZzZXRzKCkpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IG9mZnNldC55ICsgdGhpcy5jdXJyZW50U2hhcGUuZ2V0Um93KCk7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBvZmZzZXQueCArIHRoaXMuY3VycmVudFNoYXBlLmdldENvbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMubWF0cml4Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sIDwgMCB8fCBjb2wgPj0gdGhpcy5tYXRyaXhbcm93XS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W3Jvd11bY29sXS5nZXRDb2xvcigpICE9PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sbGlzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlRnVsbEJvYXJkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBmdWxsID0gdGhpcy5pc0JvYXJkRnVsbCgpO1xyXG4gICAgICAgIGlmIChmdWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIHNlcXVlbmNlIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEJvYXJkRmlsbGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIGZ1bGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEl0IGlzIGNvbnNpZGVyZWQgZnVsbCBpZiB0aGUgdHdvIG9ic2N1cmVkIHJvd3MgYXQgdGhlIHRvcCBoYXZlIGNvbG9yZWQgY2VsbHMgaW4gdGhlbS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpc0JvYXJkRnVsbCgpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCAyOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xJZHggPSAwOyBjb2xJZHggPCBNQVhfQ09MUzsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwuZ2V0Q29sb3IoKSAhPT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAxIG9mIDIsIGJlZm9yZSBhbmltYXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG4gICAgICAgIGlmIChmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBSb3dzRmlsbGVkRXZlbnQoZmlsbGVkUm93SWR4cywgdGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTdGF0ZSA9IEJvYXJkU3RhdGUuUGF1c2VkOyAvLyBTdGFuZGJ5IHVudGlsIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBubyBmaWxsZWQgbGluZXMuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZmlsbGVkIGxpbmVzIG1ldGhvZCAyIG9mIDIsIGFmdGVyIGFuaW1hdGlvbi5cclxuICAgICAqIFRoaXMgaXMgcHVibGljIHNvIHRoYXQgdGhlIE1vZGVsIGNhbiBjYWxsIGl0LlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVBbnlGaWxsZWRMaW5lc1BhcnQyKCkge1xyXG4gICAgICAgIC8vIEhhdmUgdG8gY2hlY2sgdGhpcyBhZ2FpbiBiZWNhdXNlIHRoZXJlIGlzIGEgc2xpZ2h0IGNoYW5jZSB0aGF0IHJvd3Mgc2hpZnRlZCBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cclxuICAgICAgICBsZXQgZmlsbGVkUm93SWR4cyA9IHRoaXMuZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGZpbGxlZCByb3dzLlxyXG4gICAgICAgIC8vIEkgdGhpbmsgdGhpcyBvbmx5IHdvcmtzIGJlY2F1c2UgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpIHJldHVybnMgYW4gYXJyYXkgc29ydGVkIGFzY2VuZGluZyBmcm9tIDAuXHJcbiAgICAgICAgLy8gSWYgaXQgd2Fzbid0IHNvcnRlZCB0aGVuIGl0IGNvdWxkIGVuZCB1cCBza2lwcGluZyByb3dzLlxyXG4gICAgICAgIGZvciAobGV0IGZpbGxlZFJvd0lkeCBvZiBmaWxsZWRSb3dJZHhzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoZmlsbGVkUm93SWR4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhdmUgdG8gc2VuZCBjZWxsIGNoYW5nZSBub3RpZmljYXRpb25zIGJlY2F1c2UgcmVtb3ZlQW5kQ29sbGFwc2UoKSBkb2VzIG5vdC5cclxuICAgICAgICB0aGlzLm5vdGlmeUFsbENlbGxzKCk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGlvbiB3YXMgZmluaXNoZWQgYW5kIGJvYXJkIHdhcyB1cGRhdGVkLCBzbyByZXN1bWUgcGxheS5cclxuICAgICAgICB0aGlzLmJvYXJkU3RhdGUgPSBCb2FyZFN0YXRlLkluUGxheTtcclxuICAgICAgICB0aGlzLnN0YXJ0U2hhcGUoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBvbmx5IHRoZSBib3R0b20gcm93LlxyXG4gICAgICovXHJcbiAgICByZW1vdmVCb3R0b21MaW5lKCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQW5kQ29sbGFwc2UoTUFYX1JPV1MgLSAxKTtcclxuXHJcbiAgICAgICAgLy8gSGF2ZSB0byBzZW5kIGNlbGwgY2hhbmdlIG5vdGlmaWNhdGlvbnMgYmVjYXVzZSByZW1vdmVBbmRDb2xsYXBzZSgpIGRvZXMgbm90LlxyXG4gICAgICAgIHRoaXMubm90aWZ5QWxsQ2VsbHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5vdGlmeUFsbENlbGxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IE1BWF9ST1dTOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sSWR4ID0gMDsgY29sSWR4IDwgcm93Lmxlbmd0aDsgY29sSWR4KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5tYXRyaXhbcm93SWR4XVtjb2xJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudEJ1cy5maXJlKG5ldyBDZWxsQ2hhbmdlRXZlbnQoY2VsbCwgcm93SWR4LCBjb2xJZHgsIHRoaXMucGxheWVyVHlwZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgbnVtYmVycywgYXNjZW5kaW5nLCB0aGF0IGNvcnJlc3BvbmQgdG8gZmlsbGVkIHJvd3MuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lRmlsbGVkUm93SWR4cygpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IGZpbGxlZFJvd0lkeHM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgdGhpcy5tYXRyaXgubGVuZ3RoOyByb3dJZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gdGhpcy5tYXRyaXhbcm93SWR4XTtcclxuICAgICAgICAgICAgbGV0IGZpbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNlbGwgb2Ygcm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5nZXRDb2xvcigpID09PSBDb2xvci5FbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIGZpbGxlZFJvd0lkeHMucHVzaChyb3dJZHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaWxsZWRSb3dJZHhzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyByZW1vdmVzIHRoZSBvbGQgcm93IGFuZCBwdXRzIGEgbmV3IHJvdyBpbiBpdHMgcGxhY2UgYXQgcG9zaXRpb24gMCwgd2hpY2ggaXMgdGhlIGhpZ2hlc3QgdmlzdWFsbHkgdG8gdGhlIHBsYXllci5cclxuICAgICAqIERlbGVnYXRlcyBjZWxsIG5vdGlmaWNhdGlvbiB0byB0aGUgY2FsbGluZyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQW5kQ29sbGFwc2Uocm93SWR4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2Uocm93SWR4LCAxKTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5zcGxpY2UoMCwgMCwgW10pO1xyXG4gICAgICAgIGZvciAobGV0IGNvbElkeCA9IDA7IGNvbElkeCA8IE1BWF9DT0xTOyBjb2xJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFswXVtjb2xJZHhdID0gbmV3IENlbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoc3RhcnRpbmc9ZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmV2ZW50QnVzLmZpcmUobmV3IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KHRoaXMuY3VycmVudFNoYXBlLCB0aGlzLnBsYXllclR5cGUsIHN0YXJ0aW5nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXROZXh0SnVua1Jvd0NvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICBsZXQgY29sb3I6IENvbG9yO1xyXG4gICAgICAgIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IxO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmp1bmtSb3dDb2xvcklkeCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gdGhpcy5qdW5rUm93Q29sb3IyO1xyXG4gICAgICAgICAgICB0aGlzLmp1bmtSb3dDb2xvcklkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbUNvbG9ycygpOiBbQ29sb3IsIENvbG9yXSB7XHJcblxyXG4gICAgICAgIC8vIFNlbGVjdCB0d28gY29sb3JzIHRoYXQgYXJlIG5vdCBlcXVhbCB0byBlYWNoIG90aGVyLlxyXG4gICAgICAgIGxldCByYW5kMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGxldCByYW5kMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG4gICAgICAgIGlmIChyYW5kMSA9PT0gcmFuZDIpIHtcclxuICAgICAgICAgICAgcmFuZDIrKztcclxuICAgICAgICAgICAgaWYgKHJhbmQyID4gNikge1xyXG4gICAgICAgICAgICAgICAgcmFuZDIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQxKSwgdGhpcy5jb2xvckJ5TnVtYmVyKHJhbmQyKV07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29sb3JCeU51bWJlcih2YWx1ZTogbnVtYmVyKTogQ29sb3Ige1xyXG4gICAgICAgIGxldCBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgc3dpdGNoKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQ3lhbjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLlB1cnBsZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuUmVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gQ29sb3IuQmx1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IENvbG9yLk9yYW5nZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSBDb2xvci5XaGl0ZTsgLy8gU2hvdWxkbid0IGdldCBoZXJlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVFdFRU46IGFueTtcclxuXHJcbmNvbnN0IEZBTExfVElNRV9NUyA9IDE3NTA7XHJcblxyXG5pbnRlcmZhY2UgRmFsbGluZ0JvYXJkIHtcclxuICAgIGNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTogbnVtYmVyO1xyXG4gICAgcmVtb3ZlQm90dG9tTGluZSgpOiB2b2lkO1xyXG4gICAgcmVzZXRBbmRQbGF5KCk6IHZvaWRcclxufVxyXG5cclxuY2xhc3MgRmFsbEd1aWRlIHtcclxuICAgIGxhc3RIZWlnaHQ6IG51bWJlcjtcclxuICAgIHR3ZWVuZWRIZWlnaHQ6IG51bWJlcjtcclxuICAgIGVsYXBzZWQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhbGxpbmdTZXF1ZW5jZXIge1xyXG5cclxuICAgIHByaXZhdGUgYm9hcmQ6IEZhbGxpbmdCb2FyZDtcclxuICAgIHByaXZhdGUgZmFsbFR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIGZhbGxUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZmFsbEd1aWRlOiBGYWxsR3VpZGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYm9hcmQ6IEZhbGxpbmdCb2FyZCkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcclxuICAgICAgICB0aGlzLmZhbGxUd2VlbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUgPSBuZXcgRmFsbEd1aWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRBbmRQbGF5KGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCA9IHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQgPSB0aGlzLmJvYXJkLmNhbGN1bGF0ZUhpZ2hlc3RDb2x1bW4oKTtcclxuICAgICAgICB0aGlzLmZhbGxHdWlkZS5lbGFwc2VkID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5mYWxsR3VpZGUpXHJcbiAgICAgICAgICAgIC50byh7dHdlZW5lZEhlaWdodDogMH0sIEZBTExfVElNRV9NUylcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpIC8vIFN1cnByaXNpbmdseSwgbGluZWFyIGlzIHRoZSBvbmUgdGhhdCBsb29rcyBtb3N0IFwicmlnaHRcIi5cclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsVHdlZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLmZhbGxHdWlkZS5lbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERvaW5nIHRoaXMgaW4gdHdvIHBhcnRzIGJlY2F1c2Ugb25Db21wbGV0ZSgpIGNhbiBzZXQgdGhlIHR3ZWVuIHRvIG51bGwuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZmFsbFR3ZWVuICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5mYWxsR3VpZGUuZWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmZhbGxUd2Vlbi51cGRhdGUodGhpcy5mYWxsR3VpZGUuZWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5mYWxsVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgbmV3SGVpZ2h0ID0gTWF0aC5jZWlsKHRoaXMuZmFsbEd1aWRlLnR3ZWVuZWRIZWlnaHQpO1xyXG4gICAgICAgICAgICBpZiAgKHRoaXMuZmFsbEd1aWRlLmxhc3RIZWlnaHQgPiBuZXdIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gdGhpcy5mYWxsR3VpZGUubGFzdEhlaWdodCAtIG5ld0hlaWdodDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGRpZmY7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZW1vdmVCb3R0b21MaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZhbGxHdWlkZS5sYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtTaGFwZX0gZnJvbSAnLi9zaGFwZSc7XHJcbmltcG9ydCB7Q29sb3J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb2xvcic7XHJcblxyXG5jbGFzcyBTaGFwZUkgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkN5YW47XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSA0O1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVJIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlSSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZUogZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkJsdWU7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdO1xyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlSiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZUooKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVMIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5PcmFuZ2U7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IHRydWU7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDAsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAwLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVMIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZU8gZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLlllbGxvdztcclxuICAgIHZhbHVlc1BlclJvdyA9IDQ7XHJcbiAgICBzdGFydGluZ0VsaWdpYmxlID0gZmFsc2U7XHJcbiAgICBtYXRyaWNlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcclxuICAgICAgICBdXHJcbiAgICBdXHJcblxyXG4gICAgZ2V0SW5zdGFuY2UoKTogU2hhcGVPIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYXBlTygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFwZVMgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgICBjb2xvciA9IENvbG9yLkdyZWVuO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSBmYWxzZTtcclxuICAgIG1hdHJpY2VzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMSwgMSxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDEsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF1cclxuICAgIF1cclxuXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBTaGFwZVMge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2hhcGVTKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXBlVCBleHRlbmRzIFNoYXBlIHtcclxuICAgIGNvbG9yID0gQ29sb3IuUHVycGxlO1xyXG4gICAgdmFsdWVzUGVyUm93ID0gMztcclxuICAgIHN0YXJ0aW5nRWxpZ2libGUgPSB0cnVlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMSxcclxuICAgICAgICAgICAgMCwgMSwgMFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlVCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVQoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVaIGV4dGVuZHMgU2hhcGUge1xyXG4gICAgY29sb3IgPSBDb2xvci5SZWQ7XHJcbiAgICB2YWx1ZXNQZXJSb3cgPSAzO1xyXG4gICAgc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgbWF0cmljZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAxLFxyXG4gICAgICAgICAgICAwLCAwLCAwXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDEsXHJcbiAgICAgICAgICAgIDAsIDEsIDBcclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgMCwgMCwgMCxcclxuICAgICAgICAgICAgMSwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAxLCAwLFxyXG4gICAgICAgICAgICAxLCAwLCAwXHJcbiAgICAgICAgXVxyXG4gICAgXVxyXG5cclxuICAgIGdldEluc3RhbmNlKCk6IFNoYXBlWiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaGFwZVooKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlRmFjdG9yeSB7XHJcbiAgICBwcml2YXRlIGJhZzogU2hhcGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnJlZmlsbEJhZyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0U2hhcGUoZm9yY2VCYWdSZWZpbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5iYWcubGVuZ3RoIDw9IDAgfHwgZm9yY2VCYWdSZWZpbGwgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZpbGxCYWcoZm9yY2VCYWdSZWZpbGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5iYWcucG9wKCk7IC8vIEdldCBmcm9tIGVuZCBvZiBhcnJheS5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZmlsbEJhZyhzdGFydGluZ1BpZWNlQXNGaXJzdDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuYmFnID0gW1xyXG4gICAgICAgICAgICBuZXcgU2hhcGVJKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZUooKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlTCgpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVUKCksXHJcbiAgICAgICAgICAgIG5ldyBTaGFwZU8oKSxcclxuICAgICAgICAgICAgbmV3IFNoYXBlUygpLFxyXG4gICAgICAgICAgICBuZXcgU2hhcGVaKClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEZpc2hlci1ZYXRlcyBTaHVmZmxlLCBiYXNlZCBvbjogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjQ1MDk3NlxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5iYWcubGVuZ3RoXHJcbiAgICAgICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgICAgIHdoaWxlICgwICE9PSBpZHgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICAgICAgbGV0IHJuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGlkeCk7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFnW2lkeF0gPSB0aGlzLmJhZ1tybmRJZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWdbcm5kSWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9ubHkgY2VydGFpbiBzaGFwZXMgY2FuIGJlIGRyb3BwZWQgb250byB3aGF0IGNvdWxkIGJlIGEgYmxhbmsgb3IgYWxtb3N0LWJsYW5rIGdyaWQuXHJcbiAgICAgICAgaWYgKHN0YXJ0aW5nUGllY2VBc0ZpcnN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0SWR4ID0gdGhpcy5iYWcubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmFnW2xhc3RJZHhdLnN0YXJ0aW5nRWxpZ2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nLlxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbGFzdElkeDsgaWR4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5iYWdbaWR4XS5zdGFydGluZ0VsaWdpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wVmFsID0gdGhpcy5iYWdbbGFzdElkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFnW2xhc3RJZHhdID0gdGhpcy5iYWdbaWR4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWdbaWR4XSA9IHRlbXBWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZGVhZFNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTsgLy8gVXNlZCBieSBBSS4iLCJpbXBvcnQge0NlbGxPZmZzZXR9IGZyb20gJy4uLy4uL2RvbWFpbi9jZWxsJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuXHJcbmNvbnN0IFNQQVdOX0NPTCA9IDM7IC8vIExlZnQgc2lkZSBvZiBtYXRyaXggc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhpcy5cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTaGFwZSB7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSBjb2xvcjogQ29sb3I7XHJcbiAgICBhYnN0cmFjdCByZWFkb25seSB2YWx1ZXNQZXJSb3c6IG51bWJlcjtcclxuICAgIGFic3RyYWN0IHJlYWRvbmx5IHN0YXJ0aW5nRWxpZ2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1hdHJpY2VzOiBSZWFkb25seUFycmF5PFJlYWRvbmx5QXJyYXk8bnVtYmVyPj47XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5zdGFuY2UoKTogU2hhcGU7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TWF0cml4SW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcm93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDsgLy8gVE9ETzogRW5zdXJlIHBvc2l0aW9uIDAgaXMgdGhlIHNwYXduIHBvc2l0aW9uXHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuY29sID0gU1BBV05fQ09MO1xyXG4gICAgICAgIHRoaXMuc3RhcnRpbmdFbGlnaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIHRoaXMuY29sLS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMuY29sKys7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIHRoaXMucm93LS07XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgdGhpcy5yb3crKztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG9Ub3AoKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWF0cml4SW5kZXggLT0gMTtcclxuICAgICAgICB0aGlzLmVuc3VyZUFycmF5Qm91bmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQ2xvY2t3aXNlKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ICs9IDE7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVBcnJheUJvdW5kcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3c7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Um93KHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2woY29sOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpLmxlbmd0aCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRPZmZzZXRzKCk6IENlbGxPZmZzZXRbXSB7XHJcbiAgICAgICAgbGV0IG1hdHJpeCA9IHRoaXMuZ2V0Q3VycmVudE1hdHJpeCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRzOiBDZWxsT2Zmc2V0W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXRyaXgubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRyaXhbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGlkeCAlIHRoaXMudmFsdWVzUGVyUm93O1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGlkeCAvIHRoaXMudmFsdWVzUGVyUm93KTtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBuZXcgQ2VsbE9mZnNldCh4LCB5KTtcclxuICAgICAgICAgICAgICAgIG9mZnNldHMucHVzaChvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFja3kgbWV0aG9kIHVzZWQgYnkgdGhlIEFJLlxyXG4gICAgICogXCJTaW1wbGVcIiBhcyBpbiBkb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBjdXJyZW50IHJvdy9jb2wvbWF0cml4IGlzLlxyXG4gICAgICovXHJcbiAgICBjbG9uZVNpbXBsZSgpOiBTaGFwZSB7XHJcbiAgICAgICAgLy8gR2V0IGFuIGluc3RhbmNlIG9mIHRoZSBjb25jcmV0ZSBjbGFzcy4gUmVzdCBvZiB2YWx1ZXMgYXJlIGlycmVsZXZhbnQuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cmljZXNbdGhpcy5jdXJyZW50TWF0cml4SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQXJyYXlCb3VuZHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRyaXhJbmRleCA9IHRoaXMubWF0cmljZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID49IHRoaXMubWF0cmljZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1hdHJpeEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJjb25zdCBjZWxscyA9IFtcclxuICAgIFsnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJ10sIC8vIFRvcCB0d28gYXJlIG9ic2N1cmVkXHJcbiAgICBbJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnXSxcclxuICAgIFsnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJ3gnLCAnICcsICcgJywgJyAnLCAneCcsICcgJywgJyAnLCAnICcsICcgJ10sXHJcbiAgICBbJyAnLCAneCcsICcgJywgJyAnLCAnICcsICd4JywgJyAnLCAnICcsICcgJywgJyAnXSxcclxuICAgIFsnICcsICd4JywgJyAnLCAneCcsICcgJywgJ3gnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAneCcsICcgJywgJ3gnLCAnICcsICcgJywgJyAnLCAnICcsICcgJ10sXHJcbiAgICBbJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnXSxcclxuICAgIFsnICcsICcgJywgJyAnLCAneCcsICd4JywgJ3gnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAnICcsICcgJywgJ3gnLCAnICcsICcgJywgJyAnLCAnICcsICcgJ10sXHJcbiAgICBbJyAnLCAnICcsICcgJywgJyAnLCAneCcsICcgJywgJyAnLCAnICcsICcgJywgJyAnXSxcclxuICAgIFsnICcsICcgJywgJyAnLCAneCcsICd4JywgJ3gnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJ10sXHJcbiAgICBbJyAnLCAnICcsICcgJywgJyAnLCAnICcsICd4JywgJyAnLCAnICcsICd4JywgJyAnXSxcclxuICAgIFsnICcsICcgJywgJyAnLCAnICcsICcgJywgJ3gnLCAneCcsICcgJywgJ3gnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAnICcsICcgJywgJyAnLCAneCcsICcgJywgJ3gnLCAneCcsICcgJ10sXHJcbiAgICBbJyAnLCAnICcsICcgJywgJyAnLCAnICcsICd4JywgJyAnLCAnICcsICd4JywgJyAnXSxcclxuICAgIFsnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICddLFxyXG4gICAgWycgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJywgJyAnLCAnICcsICcgJ10sXHJcbl1cclxuXHJcbmNsYXNzIFdpbiB7XHJcbiAgICBcclxuICAgIGhhc0NlbGwocm93SWR4OiBudW1iZXIsIGNvbElkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHJvd0lkeCA8IGNlbGxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gY2VsbHNbcm93SWR4XTtcclxuICAgICAgICAgICAgaWYgKGNvbElkeCA8IHJvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsc1tyb3dJZHhdW2NvbElkeF0gPT09ICd4Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHdpbiA9IG5ldyBXaW4oKTtcclxuIiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlfSBmcm9tICcuLi9nYW1lLXN0YXRlJztcclxuXHJcbmltcG9ydCB7bnBjTWFuYWdlcn0gZnJvbSAnLi9ucGMvbnBjLW1hbmFnZXInO1xyXG5pbXBvcnQge3BsYXlpbmdBY3Rpdml0eX0gZnJvbSAnLi9wbGF5aW5nLWFjdGl2aXR5JztcclxuaW1wb3J0IHtldmVudEJ1cywgRXZlbnRUeXBlfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge0ZhbGxpbmdTZXF1ZW5jZXJFdmVudH0gZnJvbSAnLi4vZXZlbnQvZmFsbGluZy1zZXF1ZW5jZXItZXZlbnQnO1xyXG5pbXBvcnQge1BsYXllclR5cGV9IGZyb20gJy4uL2RvbWFpbi9wbGF5ZXItdHlwZSc7XHJcbmltcG9ydCB7dml0YWxzfSBmcm9tICcuL3ZpdGFscyc7XHJcblxyXG5jb25zdCBlbnVtIEVuZGluZ1N0YXRlIHtcclxuICAgIENsZWFyaW5nQm9hcmRzLFxyXG4gICAgRGVsYXlpbmdPbmVTZWNvbmQsXHJcbiAgICBTY3JvbGxXaW5uZXJVcFxyXG59XHJcblxyXG5jbGFzcyBFbmRlZEFjdGl2aXR5IHtcclxuXHJcbiAgICBwcml2YXRlIGVuZGVkU3RhcnRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmVuZGVkU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKTogR2FtZVN0YXRlVHlwZSB7XHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGVwKGVsYXBzZWQpOyAvLyBUaGlzIGlzIGF0IHRoZSBwb2ludCBvZiBhIGdhbWUgamFtIHdoZXJlIEkganVzdCBjcm9zcyBteSBmaW5nZXJzIGFuZCBob3BlIHNvbWUgdGhpbmdzIGp1c3Qgd29yay5cclxuICAgICAgICBwbGF5aW5nQWN0aXZpdHkuc3RlcChlbGFwc2VkKTsgLy8gRGl0dG8uXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmVuZGVkU3RhcnRlZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmRlZFN0YXJ0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcGxheWluZ0FjdGl2aXR5LmNsZWFyQm9hcmRzKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZWxheSBmb3IgMSBzZWNvbmQgKEhQIGlzIGJsaW5raW5nIGF0IHRoaXMgdGltZSlcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlXaW5uZXIoKTtcclxuICAgICAgICAgICAgfSwgMTAwMClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBHYW1lU3RhdGVUeXBlLkVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGlzcGxheVdpbm5lcigpIHtcclxuICAgICAgICBwbGF5aW5nQWN0aXZpdHkuZGlzcGxheUVuZGluZygpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBGYWxsaW5nU2VxdWVuY2VyRXZlbnQoUGxheWVyVHlwZS5BaSkpOyAgICAvLyBRdWljayBoYWNrIHRvIGNsZWFyIHRoZSBsaWdodHNcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBGYWxsaW5nU2VxdWVuY2VyRXZlbnQoUGxheWVyVHlwZS5IdW1hbikpOyAvLyBRdWljayBoYWNrIHRvIGNsZWFyIHRoZSBsaWdodHNcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVRoYW5rcygpO1xyXG4gICAgICAgIH0sIDI1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGlzcGxheVRoYW5rcygpIHtcclxuICAgICAgICBsZXQgbWVzc2FnZSA9IDxIVE1MRGl2RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lc3NhZ2UnKTtcclxuICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gJ1RIRSBFTkQgLSBUaGFua3MgZm9yIHBsYXlpbmcgYWxsIHRoZSB3YXkgdGhyb3VnaCBvdXIgR2l0SHViIEdhbWUgT2ZmIDIwMTYgZW50cnkuJztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgZW5kZWRBY3Rpdml0eSA9IG5ldyBFbmRlZEFjdGl2aXR5KCk7IiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlfSBmcm9tICcuLi9nYW1lLXN0YXRlJztcclxuaW1wb3J0IHtHYW1lU3RhdGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2dhbWUtc3RhdGUtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7SW50cm9LZXlQcmVzc2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2ludHJvLWtleS1wcmVzc2VkLWV2ZW50JztcclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge25wY01hbmFnZXJ9IGZyb20gJy4vbnBjL25wYy1tYW5hZ2VyJztcclxuaW1wb3J0IHtwbGF5aW5nQWN0aXZpdHl9IGZyb20gJy4vcGxheWluZy1hY3Rpdml0eSc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtIcENoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvaHAtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7UEFORUxfQ09VTlRfUEVSX0ZMT09SfSBmcm9tICcuLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtjYW1lcmFXcmFwcGVyfSBmcm9tICcuLi92aWV3L2NhbWVyYS13cmFwcGVyJztcclxuXHJcbi8qKlxyXG4gKiBXcmFwcyBwbGF5aW5nIGFjdGl2aXR5IHRvIGJlIGFibGUgdG8gc2hvdyB0aGUgaW5pdGlhbCBvZmZpY2UgbGlnaHRzLiBcclxuICovXHJcbmNsYXNzIEludHJvQWN0aXZpdHkge1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHRpbWVJbkludHJvOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBsYXllckhhc0hpdEFLZXk6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGhwQmFyc0ZpbGxlZENvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGludHJvSXNDb21wbGV0ZTogYm9vbGVhbjtcclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLnRpbWVJbkludHJvID0gMDtcclxuICAgICAgICB0aGlzLnBsYXllckhhc0hpdEFLZXkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmhwQmFyc0ZpbGxlZENvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmludHJvSXNDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuR2FtZVN0YXRlQ2hhbmdlZFR5cGUsIChldmVudDogR2FtZVN0YXRlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5nYW1lU3RhdGVUeXBlID09PSBHYW1lU3RhdGVUeXBlLkludHJvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUdhbWVTdGF0ZUNoYW5nZWRFdmVudEludHJvKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkludHJvS2V5UHJlc3NlZEV2ZW50VHlwZSwgKGV2ZW50OiBJbnRyb0tleVByZXNzZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJIYXNIaXRBS2V5ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJIYXNIaXRBS2V5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbkludHJvVG9QbGF5aW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcik6IEdhbWVTdGF0ZVR5cGUge1xyXG4gICAgICAgIHRoaXMudGltZUluSW50cm8gKz0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgbnBjTWFuYWdlci5zdGVwKGVsYXBzZWQpOyAvLyBUaGlzIGlzIGF0IHRoZSBwb2ludCBvZiBhIGdhbWUgamFtIHdoZXJlIEkganVzdCBjcm9zcyBteSBmaW5nZXJzIGFuZCBob3BlIHNvbWUgdGhpbmdzIGp1c3Qgd29yay5cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW50cm9Jc0NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBHYW1lU3RhdGVUeXBlLlBsYXlpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEdhbWVTdGF0ZVR5cGUuSW50cm87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHVwIHRoZSBib2FyZCBpbiBhIHdheSB0aGF0IG1ha2VzIHRoZSBidWlsZGluZyBsb29rIGxpa2UgYSBub3JtYWwgYnVpbGRpbmcuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlR2FtZVN0YXRlQ2hhbmdlZEV2ZW50SW50cm8oKSB7XHJcbiAgICAgICAgcGxheWluZ0FjdGl2aXR5LmdlbmVyYXRlUmFuZG9tV2hpdGVDZWxscygpO1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEhwQ2hhbmdlZEV2ZW50KDAsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBIcENoYW5nZWRFdmVudCgwLCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uSW50cm9Ub1BsYXlpbmcoKSB7XHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5wYW5Ub1BsYXlpbmdGb2N1cygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucmVtb3ZlV2hpdGVDZWxsKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5saWdodFVwSHBCYXJzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVXaGl0ZUNlbGwoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgY2VsbHNMZWZ0ID0gcGxheWluZ0FjdGl2aXR5LmNsZWFyV2hpdGVDZWxsKCk7XHJcbiAgICAgICAgaWYgKGNlbGxzTGVmdCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVtb3ZlV2hpdGVDZWxsKGNhbGxiYWNrKSwgMjUwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGxpZ2h0VXBIcEJhcnMoKSB7XHJcbiAgICAgICAgdGhpcy5ocEJhcnNGaWxsZWRDb3VudCArPSAxO1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEhwQ2hhbmdlZEV2ZW50KHRoaXMuaHBCYXJzRmlsbGVkQ291bnQsIFBsYXllclR5cGUuSHVtYW4pKTtcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBIcENoYW5nZWRFdmVudCh0aGlzLmhwQmFyc0ZpbGxlZENvdW50LCBQbGF5ZXJUeXBlLkFpKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuaHBCYXJzRmlsbGVkQ291bnQgPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1IpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmxpZ2h0VXBIcEJhcnMoKSwgMjUwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmludHJvSXNDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBpbnRyb0FjdGl2aXR5ID0gbmV3IEludHJvQWN0aXZpdHkoKTsiLCJpbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi4vZ2FtZS1zdGF0ZSc7XHJcbmltcG9ydCB7aW50cm9BY3Rpdml0eX0gZnJvbSAnLi9pbnRyby1hY3Rpdml0eSc7XHJcbmltcG9ydCB7cGxheWluZ0FjdGl2aXR5fSBmcm9tICcuL3BsYXlpbmctYWN0aXZpdHknO1xyXG5pbXBvcnQge2VuZGVkQWN0aXZpdHl9IGZyb20gJy4vZW5kZWQtYWN0aXZpdHknO1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGludHJvQWN0aXZpdHkuc3RhcnQoKTtcclxuICAgICAgICBwbGF5aW5nQWN0aXZpdHkuc3RhcnQoKTtcclxuICAgICAgICBlbmRlZEFjdGl2aXR5LnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWxlZ2F0ZSBzdGVwKCkgdG8gYWN0aXZpdGllcy5cclxuICAgICAqIERldGVybWluZSBuZXh0IHN0YXRlIGZyb20gYWN0aXZpdGllcy5cclxuICAgICAqL1xyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSBnYW1lU3RhdGUuZ2V0Q3VycmVudCgpO1xyXG4gICAgICAgIGxldCBuZXdTdGF0ZTogR2FtZVN0YXRlVHlwZTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChvbGRTdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZSA9IGludHJvQWN0aXZpdHkuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuUGxheWluZzpcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlID0gcGxheWluZ0FjdGl2aXR5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLkVuZGVkOlxyXG4gICAgICAgICAgICAgICAgbmV3U3RhdGUgPSBlbmRlZEFjdGl2aXR5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3U3RhdGUgIT09IG9sZFN0YXRlKSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZS5zZXRDdXJyZW50KG5ld1N0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKCk7IiwiaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJztcclxuaW1wb3J0IHtOcGNMb2NhdGlvbiwgRm9jdXNQb2ludH0gZnJvbSAnLi9ucGMtbG9jYXRpb24nO1xyXG5pbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi4vLi4vZ2FtZS1zdGF0ZSc7XHJcblxyXG5jbGFzcyBDcm93ZFN0YXRzIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxlcG9ydCB0aGUgTlBDIHNvbWV3aGVyZSwgZGVwZW5kaW5nIG9uIGdhbWVTdGF0ZS5cclxuICAgICAqL1xyXG4gICAgZ2l2ZUluaXRpYWxEaXJlY3Rpb24obnBjOiBOcGMpIHtcclxuICAgICAgICBzd2l0Y2ggKGdhbWVTdGF0ZS5nZXRDdXJyZW50KCkpIHtcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLlBsYXlpbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVOcGNPZmZTY3JlZW4obnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludHJvVGVsZXBvcnRPbnRvV2Fsa3dheShucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5FbmRlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RheU9mZlN0YWdlKG5wYyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW92ZU5wY09mZlNjcmVlbihucGM6IE5wYykge1xyXG4gICAgICAgIGxldCBvZmZzY3JlZW4gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcclxuICAgICAgICBpZiAob2Zmc2NyZWVuID09IDApIHtcclxuICAgICAgICAgICAgbnBjLnRlbGVwb3J0VG8oTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ0xlZnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5wYy50ZWxlcG9ydFRvKE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nUmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludHJvVGVsZXBvcnRPbnRvV2Fsa3dheShucGM6IE5wYykge1xyXG4gICAgICAgIGxldCB3YWxrd2F5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMyk7IC8vIDMgPSBUb3RhbCBudW1iZXIgb2YgQnVpbGRpbmcqIGxvY2F0aW9uc1xyXG4gICAgICAgIHN3aXRjaCAod2Fsa3dheSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIEJ1aWxkaW5nTGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nTGVmdChucGMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gQnVpbGRpbmdSaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nUmlnaHQobnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIEJ1aWxkaW5nTWlkZGxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmludHJvVGVsZXBvcnRPbnRvQnVpbGRpbmdNaWRkbGUobnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nTGVmdChucGM6IE5wYykge1xyXG4gICAgICAgIG5wYy50ZWxlcG9ydFRvKE5wY0xvY2F0aW9uLkJ1aWxkaW5nTGVmdCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDApIHsgLy8gR28gbGVmdFxyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gR28gcmlnaHRcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nTWlkZGxlKTtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZlJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRyb1RlbGVwb3J0T250b0J1aWxkaW5nUmlnaHQobnBjOiBOcGMpIHtcclxuICAgICAgICBucGMudGVsZXBvcnRUbyhOcGNMb2NhdGlvbi5CdWlsZGluZ1JpZ2h0KTtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMCkgeyAvLyBHbyBsZWZ0XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ01pZGRsZSk7XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZMZWZ0KTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBHbyByaWdodFxyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmUmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludHJvVGVsZXBvcnRPbnRvQnVpbGRpbmdNaWRkbGUobnBjOiBOcGMpIHtcclxuICAgICAgICBucGMudGVsZXBvcnRUbyhOcGNMb2NhdGlvbi5CdWlsZGluZ1JpZ2h0KTtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMCkgeyAvLyBHbyBsZWZ0XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZMZWZ0KTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBHbyByaWdodFxyXG4gICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uT2ZmUmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlbGwgYSB3YWl0aW5nIE5QQyB3aGF0IHRvIGRvLCBkZXBlbmRpbmcgb24gZ2FtZVN0YXRlLlxyXG4gICAgICovXHJcbiAgICBnaXZlRGlyZWN0aW9uKG5wYzogTnBjKSB7XHJcbiAgICAgICAgc3dpdGNoIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5JbnRybzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2l2ZURpcmVjdGlvbkludHJvKG5wYyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLlBsYXlpbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdpdmVEaXJlY3Rpb25QbGF5aW5nKG5wYyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLkVuZGVkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5naXZlRGlyZWN0aW9uRW5kZWQobnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYXZlIGFuIG9mZnNjcmVlbiBOUEMgd2FsayB0byB0aGUgbWlkZGxlIGFuZCB0aGVtIGJhY2sgb2Zmc2NyZWVuLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdpdmVEaXJlY3Rpb25JbnRybyhucGM6IE5wYykge1xyXG4gICAgICAgIGxldCBzaWRlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XHJcbiAgICAgICAgaWYgKHNpZGUgPT09IDApIHtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nTWlkZGxlKTtcclxuICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZkxlZnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ01pZGRsZSk7XHJcbiAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZSaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2l2ZURpcmVjdGlvblBsYXlpbmcobnBjOiBOcGMpIHtcclxuICAgICAgICBsZXQgYWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xyXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgdGhpcy5naXZlRGlyZWN0aW9uUGxheWluZ1N0YW5kKG5wYyk7XHJcbiAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5naXZlRGlyZWN0aW9uUGxheWluZ01vdmUobnBjKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnaXZlRGlyZWN0aW9uUGxheWluZ1N0YW5kKG5wYzogTnBjKSB7XHJcbiAgICAgICAgbGV0IHNpZGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKTtcclxuICAgICAgICBpZiAoc2lkZSA9PT0gMCkge1xyXG4gICAgICAgICAgICBucGMuc3RhbmRGYWNpbmcoRm9jdXNQb2ludC5CdWlsZGluZ1JpZ2h0LCAxNTAwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnBjLnN0YW5kRmFjaW5nKEZvY3VzUG9pbnQuQnVpbGRpbmdMZWZ0LCAxNTAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2l2ZURpcmVjdGlvblBsYXlpbmdNb3ZlKG5wYzogTnBjKSB7XHJcbiAgICAgICAgbGV0IHdoZXJlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpO1xyXG4gICAgICAgIHN3aXRjaCAod2hlcmUpIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLk9mZkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZSaWdodCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgIGNhc2UgNzpcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5CdWlsZGluZ0xlZnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICBjYXNlIDEwOlxyXG4gICAgICAgICAgICBjYXNlIDExOlxyXG4gICAgICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgbnBjLmFkZFdheXBvaW50KE5wY0xvY2F0aW9uLkJ1aWxkaW5nUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTQ6XHJcbiAgICAgICAgICAgIGNhc2UgMTU6XHJcbiAgICAgICAgICAgIGNhc2UgMTY6XHJcbiAgICAgICAgICAgIGNhc2UgMTc6XHJcbiAgICAgICAgICAgIGNhc2UgMTg6XHJcbiAgICAgICAgICAgIGNhc2UgMTk6XHJcbiAgICAgICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uQnVpbGRpbmdNaWRkbGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjA6XHJcbiAgICAgICAgICAgIGNhc2UgMjE6XHJcbiAgICAgICAgICAgIGNhc2UgMjI6XHJcbiAgICAgICAgICAgIGNhc2UgMjM6XHJcbiAgICAgICAgICAgIGNhc2UgMjQ6XHJcbiAgICAgICAgICAgIGNhc2UgMjU6XHJcbiAgICAgICAgICAgICAgICBucGMuYWRkV2F5cG9pbnQoTnBjTG9jYXRpb24uTWlkZGxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBKdXN0IGRvbid0IGdvIGFueXdoZXJlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RheU9mZlN0YWdlKG5wYzogTnBjKSB7XHJcbiAgICAgICAgbnBjLnRlbGVwb3J0VG8oTnBjTG9jYXRpb24uT2ZmTGVmdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnaXZlRGlyZWN0aW9uRW5kZWQobnBjOiBOcGMpIHtcclxuICAgICAgICBpZiAobnBjLmVuZGVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBucGMuZW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgbGV0IG9mZnNjcmVlbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2NyZWVuID09IDApIHtcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZMZWZ0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5wYy5hZGRXYXlwb2ludChOcGNMb2NhdGlvbi5PZmZSaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBucGMuc3RhbmRGYWNpbmcoRm9jdXNQb2ludC5CdWlsZGluZ0xlZnQsIDIwMDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGNyb3dkU3RhdHMgPSBuZXcgQ3Jvd2RTdGF0cygpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmltcG9ydCB7R2FtZVN0YXRlVHlwZSwgZ2FtZVN0YXRlfSBmcm9tICcuLi8uLi9nYW1lLXN0YXRlJztcclxuaW1wb3J0IHtOcGN9IGZyb20gJy4vbnBjJ1xyXG5pbXBvcnQge05wY0xvY2F0aW9uLCBGb2N1c1BvaW50fSBmcm9tICcuL25wYy1sb2NhdGlvbic7XHJcbmltcG9ydCB7ZXZlbnRCdXMsIEV2ZW50VHlwZX0gZnJvbSAnLi4vLi4vZXZlbnQvZXZlbnQtYnVzJztcclxuaW1wb3J0IHtTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9zdGFuZGVlLW1vdmVtZW50LWVuZGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNQbGFjZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXBsYWNlZC1ldmVudCc7XHJcbmltcG9ydCB7VE9UQUxfTlBDUywgcmVsZWFzZVRpbWVyfSBmcm9tICcuL3JlbGVhc2UtdGltZXInO1xyXG5pbXBvcnQge2Nyb3dkU3RhdHN9IGZyb20gJy4vY3Jvd2Qtc3RhdHMnO1xyXG5cclxuY2xhc3MgTnBjTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBucGNzOiBNYXA8bnVtYmVyLCBOcGM+O1xyXG5cclxuICAgIHByaXZhdGUgbnBjc09mZnNjcmVlbjogTnBjW107XHJcbiAgICBwcml2YXRlIG5wY3NJblBsYXk6IE5wY1tdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubnBjcyA9IG5ldyBNYXA8bnVtYmVyLCBOcGM+KCk7XHJcblxyXG4gICAgICAgIHRoaXMubnBjc09mZnNjcmVlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubnBjc0luUGxheSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5TdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50VHlwZSwgKGV2ZW50OiBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFJlZ2lzdGVyIGxpc3RlbmVycyBmb3IgZ2FtZSBldmVudHMsIGxpa2UgYm9hcmQgY29sbGFwc2Ugb3IgaWYgYSBzaGFwZSBjYXVzZWQgaG9sZXMuXHJcblxyXG4gICAgICAgIGZvciAobGV0IG5wY0lkeCA9IDA7IG5wY0lkeCA8IFRPVEFMX05QQ1M7IG5wY0lkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBucGMgPSBuZXcgTnBjKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNyb3dkU3RhdHMuZ2l2ZURpcmVjdGlvbihucGMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5wYy5zdGFydCgpO1xyXG4gICAgICAgICAgICB0aGlzLm5wY3Muc2V0KG5wYy5pZCwgbnBjKTtcclxuICAgICAgICAgICAgdGhpcy5ucGNzT2Zmc2NyZWVuLnB1c2gobnBjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbGVhc2VUaW1lci5zdGFydCgpO1xyXG4gICAgICAgIGNyb3dkU3RhdHMuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBleHBlY3RlZEluUGxheSA9IHJlbGVhc2VUaW1lci5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpID09PSBHYW1lU3RhdGVUeXBlLkludHJvIHx8IGdhbWVTdGF0ZS5nZXRDdXJyZW50KCkgPT09IEdhbWVTdGF0ZVR5cGUuUGxheWluZykge1xyXG4gICAgICAgICAgICB0aGlzLmVuc3VyZUluUGxheU5wY0NvdW50KGV4cGVjdGVkSW5QbGF5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubnBjc0luUGxheS5mb3JFYWNoKChucGM6IE5wYykgPT4ge1xyXG4gICAgICAgICAgICBucGMuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUluUGxheU5wY0NvdW50KGV4cGVjdGVkSW5QbGF5OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ucGNzSW5QbGF5Lmxlbmd0aCA8IGV4cGVjdGVkSW5QbGF5KSB7XHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gZXhwZWN0ZWRJblBsYXkgLSB0aGlzLm5wY3NJblBsYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb3VudCA9IDA7IGNvdW50IDwgZGlmZjsgY291bnQrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kQW5PZmZzY3JlZW5OcGNJbnRvUGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VuZEFuT2Zmc2NyZWVuTnBjSW50b1BsYXkoKSB7XHJcbiAgICAgICAgbGV0IG5wYyA9IHRoaXMubnBjc09mZnNjcmVlbi5wb3AoKTtcclxuICAgICAgICBpZiAobnBjICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5ucGNzSW5QbGF5LnB1c2gobnBjKTtcclxuICAgICAgICAgICAgY3Jvd2RTdGF0cy5naXZlSW5pdGlhbERpcmVjdGlvbihucGMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQoZXZlbnQ6IFN0YW5kZWVNb3ZlbWVudEVuZGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgbnBjID0gdGhpcy5ucGNzLmdldChldmVudC5ucGNJZCk7XHJcbiAgICAgICAgaWYgKG5wYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHkgPSBldmVudC56O1xyXG4gICAgICAgICAgICBucGMudXBkYXRlUG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBucGNNYW5hZ2VyID0gbmV3IE5wY01hbmFnZXIoKTsiLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7TnBjUGxhY2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1wbGFjZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY01vdmVtZW50Q2hhbmdlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtbW92ZW1lbnQtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7TnBjRmFjaW5nRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy1mYWNpbmctZXZlbnQnO1xyXG5pbXBvcnQge05wY1RlbGVwb3J0ZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLXRlbGVwb3J0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY1N0YXRlfSBmcm9tICcuLi8uLi9kb21haW4vbnBjLW1vdmVtZW50LXR5cGUnO1xyXG5pbXBvcnQge05wY0xvY2F0aW9uLCBGb2N1c1BvaW50fSBmcm9tICcuL25wYy1sb2NhdGlvbic7XHJcblxyXG5leHBvcnQgY2xhc3MgTnBjIHtcclxuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcbiAgICBlbmRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRlOiBOcGNTdGF0ZTtcclxuICAgIHByaXZhdGUgc3RhbmRpbmdUdGw6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHdheXBvaW50czogTnBjTG9jYXRpb25bXTtcclxuXHJcbiAgICAvLyBcIkxhc3RcIiBhcyBpbiB0aGUgbGFzdCBrbm93biBjb29yZGluYXRlLCBiZWNhdXNlIGl0IGNvdWxkIGJlIGN1cnJlbnRseSBpbi1tb3Rpb24uXHJcbiAgICBwcml2YXRlIHhsYXN0OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHlsYXN0OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkeUZvckNvbW1hbmRDYWxsYmFjazogKCkgPT4gdm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFkeUZvckNvbW1hbmRDYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XHJcbiAgICAgICAgdGhpcy5lbmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gTnBjU3RhdGUuV2FpdGluZ0ZvckNvbW1hbmQ7XHJcbiAgICAgICAgdGhpcy5zdGFuZGluZ1R0bCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMud2F5cG9pbnRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMueGxhc3QgPSAwO1xyXG4gICAgICAgIHRoaXMueWxhc3QgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnJlYWR5Rm9yQ29tbWFuZENhbGxiYWNrID0gcmVhZHlGb3JDb21tYW5kQ2FsbGJhY2s7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gUGxhY2UgaXQgb3V0IG9mIHZpZXcgc29tZXdoZXJlLlxyXG4gICAgICAgIHRoaXMueGxhc3QgPSAtNTtcclxuICAgICAgICB0aGlzLnlsYXN0ID0gIDE1O1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY1BsYWNlZEV2ZW50KHRoaXMuaWQsIHRoaXMueGxhc3QsIHRoaXMueWxhc3QpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIE5wY1N0YXRlLldhbGtpbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZXBXYWxraW5nKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBOcGNTdGF0ZS5TdGFuZGluZzpcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RlcFN0YW5kaW5nKGVsYXBzZWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTnBjU3RhdGUuV2FpdGluZ0ZvckNvbW1hbmQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZXBXYWl0aW5nRm9yQ29tbWFuZCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBXYWxraW5nKCkge1xyXG4gICAgICAgIC8vIE1heWJlIG5vdGhpbmcgaGVyZS5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBTdGFuZGluZyhlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YW5kaW5nVHRsIC09IGVsYXBzZWQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnN0YW5kaW5nVHRsIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IE5wY1N0YXRlLldhaXRpbmdGb3JDb21tYW5kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBXYWl0aW5nRm9yQ29tbWFuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy53YXlwb2ludHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbmV4dExvY2F0aW9uID0gdGhpcy53YXlwb2ludHMuc2hpZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5iZWdpbldhbGtpbmdUbyhuZXh0TG9jYXRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlGb3JDb21tYW5kQ2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhbmRGYWNpbmcoZm9jdXNQb2ludDogRm9jdXNQb2ludCwgc3RhbmRpbmdUdGw6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5TdGFuZGluZztcclxuICAgICAgICB0aGlzLnN0YW5kaW5nVHRsID0gc3RhbmRpbmdUdGw7XHJcblxyXG4gICAgICAgIGlmIChmb2N1c1BvaW50ID09PSBGb2N1c1BvaW50LkJ1aWxkaW5nTGVmdCkge1xyXG4gICAgICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBOcGNGYWNpbmdFdmVudCh0aGlzLmlkLCA1LCAtMykpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9jdXNQb2ludCA9PT0gRm9jdXNQb2ludC5CdWlsZGluZ1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY0ZhY2luZ0V2ZW50KHRoaXMuaWQsIDE1LjUsIDUpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkV2F5cG9pbnQobG9jYXRpb246IE5wY0xvY2F0aW9uKSB7XHJcbiAgICAgICAgdGhpcy53YXlwb2ludHMucHVzaChsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduaWZpZXMgdGhlIGVuZCBvZiBhIHdhbGsuIERvZXMgbm90IHNlbmQgYW4gZXZlbnQuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy54bGFzdCA9IHg7XHJcbiAgICAgICAgdGhpcy55bGFzdCA9IHk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5XYWl0aW5nRm9yQ29tbWFuZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlbGVwb3J0cyB0aGUgTlBDIHRvIHRoZSBnaXZlbiBsb2NhdGlvbi5cclxuICAgICAqIFNlbmRzIGFuIGV2ZW50IHNvIHRoZSBzdGFuZGVlIGNhbiBiZSB1cGRhdGVkLlxyXG4gICAgICovXHJcbiAgICB0ZWxlcG9ydFRvKGxvY2F0aW9uOiBOcGNMb2NhdGlvbikge1xyXG4gICAgICAgIGxldCB4OiBudW1iZXIsIHk6IG51bWJlcjtcclxuICAgICAgICBbeCwgeV0gPSB0aGlzLmdlbmVyYXRlUmFuZG9tQ29vcmRpbmF0ZXMobG9jYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLnhsYXN0ID0geDtcclxuICAgICAgICB0aGlzLnlsYXN0ID0geTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgTnBjVGVsZXBvcnRlZEV2ZW50KHRoaXMuaWQsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJlZ2luV2Fsa2luZ1RvKGxvY2F0aW9uOiBOcGNMb2NhdGlvbikge1xyXG4gICAgICAgIGxldCB4OiBudW1iZXIsIHk6IG51bWJlcjtcclxuICAgICAgICBbeCwgeV0gPSB0aGlzLmdlbmVyYXRlUmFuZG9tQ29vcmRpbmF0ZXMobG9jYXRpb24pO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBOcGNTdGF0ZS5XYWxraW5nO1xyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KHRoaXMuaWQsIHgsIHkpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdlbmVyYXRlUmFuZG9tQ29vcmRpbmF0ZXMobG9jYXRpb246IE5wY0xvY2F0aW9uKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG4gICAgICAgIGxldCB5ID0gMDtcclxuXHJcbiAgICAgICAgc3dpdGNoIChsb2NhdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLk9mZkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBbeCwgeV0gPSB0aGlzLnJhbmRvbVdpdGhpblJhbmdlKC01LCA1LCAyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLk9mZlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgW3gsIHldID0gdGhpcy5yYW5kb21XaXRoaW5SYW5nZSgxMCwgMTUsIDIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTnBjTG9jYXRpb24uQnVpbGRpbmdMZWZ0OlxyXG4gICAgICAgICAgICAgICAgW3gsIHldID0gdGhpcy5yYW5kb21XaXRoaW5SYW5nZSg1LCA0LjUsIDIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTnBjTG9jYXRpb24uQnVpbGRpbmdSaWdodDpcclxuICAgICAgICAgICAgICAgIFt4LCB5XSA9IHRoaXMucmFuZG9tV2l0aGluUmFuZ2UoOSwgNy41LCAyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLkJ1aWxkaW5nTWlkZGxlOlxyXG4gICAgICAgICAgICAgICAgW3gsIHldID0gdGhpcy5yYW5kb21XaXRoaW5SYW5nZSgxMCwgMi41LCAyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5wY0xvY2F0aW9uLk1pZGRsZTpcclxuICAgICAgICAgICAgICAgIFt4LCB5XSA9IHRoaXMucmFuZG9tV2l0aGluUmFuZ2UoNiwgMTAsIDMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkIG5vdCBnZXQgaGVyZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFt4LCB5XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJhbmRvbVdpdGhpblJhbmdlKHg6IG51bWJlciwgeTogbnVtYmVyLCB2YXJpYW5jZTogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IHhyZXN1bHQgPSB4IC0gKHZhcmlhbmNlIC8gMikgKyAoTWF0aC5yYW5kb20oKSAqIHZhcmlhbmNlKTtcclxuICAgICAgICBsZXQgeXJlc3VsdCA9IHkgLSAodmFyaWFuY2UgLyAyKSArIChNYXRoLnJhbmRvbSgpICogdmFyaWFuY2UpO1xyXG4gICAgICAgIHJldHVybiBbeHJlc3VsdCwgeXJlc3VsdF07XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0dhbWVTdGF0ZVR5cGUsIGdhbWVTdGF0ZX0gZnJvbSAnLi4vLi4vZ2FtZS1zdGF0ZSc7XHJcbmltcG9ydCB7VElNRV9VTlRJTF9FVkVSWU9ORV9PTl9TQ1JFRU59IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5cclxuLy8gU3RhcnRpbmcgcG9zaXRpb24gY291bnRzIHVzZWQgaW4gaW5pdGlhbGl6YXRpb24uXHJcbmV4cG9ydCBjb25zdCBUT1RBTF9OUENTID0gNDA7XHJcblxyXG5jb25zdCBOUENTX1BFUl9TRUNPTkQgPSBUSU1FX1VOVElMX0VWRVJZT05FX09OX1NDUkVFTiAvIFRPVEFMX05QQ1M7XHJcbmNvbnN0IFRJTUVfVE9fUkVBQ1RfVE9fTEVBVkVfTVMgPSA1ICogMTAwMDtcclxuY29uc3QgSU5UUk9fU1RBUlRJTkdfQ09VTlQgPSA1O1xyXG5cclxuY2xhc3MgUmVsZWFzZVRpbWVyIHtcclxuXHJcbiAgICBwcml2YXRlIGludHJvVGltZUVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcGxheVRpbWVFbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGVuZFRpbWVFbGFwc2VkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5pbnRyb1RpbWVFbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLnBsYXlUaW1lRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbmRUaW1lRWxhcHNlZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBleHBlY3RlZEluUGxheSA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoZ2FtZVN0YXRlLmdldEN1cnJlbnQoKSkge1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVTdGF0ZVR5cGUuSW50cm86XHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZEluUGxheSA9IHRoaXMuc3RlcEludHJvKGVsYXBzZWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5QbGF5aW5nOlxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWRJblBsYXkgPSB0aGlzLnN0ZXBQbGF5aW5nKGVsYXBzZWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5FbmRlZDpcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkSW5QbGF5ID0gdGhpcy5zdGVwRW5kZWQoZWxhcHNlZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgbm90IGdldCBoZXJlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXhwZWN0ZWRJblBsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcEludHJvKGVsYXBzZWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5pbnRyb1RpbWVFbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgcmV0dXJuIElOVFJPX1NUQVJUSU5HX0NPVU5UO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXBQbGF5aW5nKGVsYXBzZWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5wbGF5VGltZUVsYXBzZWQgKz0gZWxhcHNlZDtcclxuXHJcbiAgICAgICAgbGV0IGV4cGVjdGVkSW5QbGF5ID0gSU5UUk9fU1RBUlRJTkdfQ09VTlQgKyBNYXRoLmZsb29yKHRoaXMucGxheVRpbWVFbGFwc2VkIC8gTlBDU19QRVJfU0VDT05EKTtcclxuICAgICAgICBpZiAoZXhwZWN0ZWRJblBsYXkgPiBUT1RBTF9OUENTKSB7XHJcbiAgICAgICAgICAgIGV4cGVjdGVkSW5QbGF5ID0gVE9UQUxfTlBDUztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBleHBlY3RlZEluUGxheTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwRW5kZWQoZWxhcHNlZDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gMDsgLy8gSnVzdCBkb24ndCBhZGQgbW9yZVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCByZWxlYXNlVGltZXIgPSBuZXcgUmVsZWFzZVRpbWVyKCk7IiwiaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge0JvYXJkfSBmcm9tICcuL2JvYXJkL2JvYXJkJztcclxuaW1wb3J0IHtBaX0gZnJvbSAnLi9haS9haSc7XHJcbmltcG9ydCB7bnBjTWFuYWdlcn0gZnJvbSAnLi9ucGMvbnBjLW1hbmFnZXInO1xyXG5pbXBvcnQge2V2ZW50QnVzLCBFdmVudFR5cGV9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtQbGF5ZXJNb3ZlbWVudH0gZnJvbSAnLi4vZG9tYWluL3BsYXllci1tb3ZlbWVudCc7XHJcbmltcG9ydCB7UGxheWVyTW92ZW1lbnRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcGxheWVyLW1vdmVtZW50LWV2ZW50JztcclxuaW1wb3J0IHtBY3RpdmVTaGFwZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYWN0aXZlLXNoYXBlLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvcm93cy1maWxsZWQtZXZlbnQnO1xyXG5pbXBvcnQge1Jvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50fSBmcm9tICcuLi9ldmVudC9yb3dzLWNsZWFyLWFuaW1hdGlvbi1jb21wbGV0ZWQtZXZlbnQnO1xyXG5pbXBvcnQge0JvYXJkRmlsbGVkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2JvYXJkLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7SHBDaGFuZ2VkRXZlbnR9IGZyb20gJy4uL2V2ZW50L2hwLWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge1NoYXBlRmFjdG9yeX0gZnJvbSAnLi9ib2FyZC9zaGFwZS1mYWN0b3J5JztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyfSBmcm9tICcuL2JvYXJkL2ZhbGxpbmctc2VxdWVuY2VyJztcclxuaW1wb3J0IHtGYWxsaW5nU2VxdWVuY2VyRXZlbnR9IGZyb20gJy4uL2V2ZW50L2ZhbGxpbmctc2VxdWVuY2VyLWV2ZW50JztcclxuaW1wb3J0IHt2aXRhbHN9IGZyb20gJy4vdml0YWxzJztcclxuXHJcbmNsYXNzIFBsYXlpbmdBY3Rpdml0eSB7XHJcbiAgICBwcml2YXRlIGh1bWFuQm9hcmQ6IEJvYXJkO1xyXG4gICAgcHJpdmF0ZSBodW1hbkZhbGxpbmdTZXF1ZW5jZXI6IEZhbGxpbmdTZXF1ZW5jZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBhaUJvYXJkOiBCb2FyZDtcclxuICAgIHByaXZhdGUgYWlGYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG5cclxuICAgIHByaXZhdGUgYWk6IEFpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxldCBodW1hblNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5IdW1hbiwgaHVtYW5TaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuaHVtYW5Cb2FyZCk7XHJcblxyXG4gICAgICAgIGxldCBhaVNoYXBlRmFjdG9yeSA9IG5ldyBTaGFwZUZhY3RvcnkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQgPSBuZXcgQm9hcmQoUGxheWVyVHlwZS5BaSwgYWlTaGFwZUZhY3RvcnksIGV2ZW50QnVzKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlciA9IG5ldyBGYWxsaW5nU2VxdWVuY2VyKHRoaXMuYWlCb2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWkgPSBuZXcgQWkodGhpcy5haUJvYXJkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUGxheWVyTW92ZW1lbnRFdmVudFR5cGUsIChldmVudDogUGxheWVyTW92ZW1lbnRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NGaWxsZWRFdmVudFR5cGUsIChldmVudDogUm93c0ZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLlJvd3NDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJvd0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQm9hcmRGaWxsZWRFdmVudFR5cGUsIChldmVudDogQm9hcmRGaWxsZWRFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEFjdGl2ZVNoYXBlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYWkuc3RhcnQoKTtcclxuICAgICAgICBucGNNYW5hZ2VyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEluc3RlYWQgb2YgaGVyZSwgc3RhcnQgZ2FtZSB3aGVuIHBsYXllciBoaXRzIGEga2V5IGZpcnN0LlxyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5yZXNldEFuZFBsYXkoKTtcclxuICAgICAgICB0aGlzLmFpQm9hcmQucmVzZXRBbmRQbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmh1bWFuRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpQm9hcmQuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlci5zdGVwKGVsYXBzZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmFpLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIG5wY01hbmFnZXIuc3RlcChlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEdhbWVTdGF0ZVR5cGUuUGxheWluZztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1aWNrIGhhY2sgdG8gZ2V0IGl0IGRvbmUuXHJcbiAgICAgKi9cclxuICAgIHN0ZXBCb2FyZHNPbmx5KGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuYWlCb2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIGJ5IEludHJvQWN0aXZpdHkuXHJcbiAgICAgKi9cclxuICAgIGdlbmVyYXRlUmFuZG9tV2hpdGVDZWxscygpIHtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQuZ2VuZXJhdGVSYW5kb21XaGl0ZUNlbGxzKCk7XHJcbiAgICAgICAgdGhpcy5haUJvYXJkLmdlbmVyYXRlUmFuZG9tV2hpdGVDZWxscygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIGJ5IEludHJvQWN0aXZpdHkuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyV2hpdGVDZWxsKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCByZXN1bHQxID0gdGhpcy5odW1hbkJvYXJkLmNsZWFyT25lV2hpdGVDZWxsKCk7XHJcbiAgICAgICAgbGV0IHJlc3VsdDIgPSB0aGlzLmFpQm9hcmQuY2xlYXJPbmVXaGl0ZUNlbGwoKTtcclxuICAgICAgICByZXR1cm4gKHJlc3VsdDEgfHwgcmVzdWx0MilcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckJvYXJkcygpIHtcclxuICAgICAgICB0aGlzLmFpQm9hcmQucmVzZXRBbmRQbGF5KGZhbHNlKTtcclxuICAgICAgICB0aGlzLmh1bWFuQm9hcmQucmVzZXRBbmRQbGF5KGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5RW5kaW5nKCkge1xyXG4gICAgICAgIGlmICh2aXRhbHMuYWlIaXRQb2ludHMgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFpQm9hcmQuZGlzcGxheUxvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5odW1hbkJvYXJkLmRpc3BsYXlXaW4oKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHZpdGFscy5odW1hbkhpdFBvaW50cyA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWlCb2FyZC5kaXNwbGF5V2luKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHVtYW5Cb2FyZC5kaXNwbGF5TG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVBsYXllck1vdmVtZW50KGV2ZW50OiBQbGF5ZXJNb3ZlbWVudEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGJvYXJkID0gdGhpcy5kZXRlcm1pbmVCb2FyZEZvcihldmVudC5wbGF5ZXJUeXBlKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChldmVudC5tb3ZlbWVudCkge1xyXG4gICAgICAgICAgICBjYXNlIFBsYXllck1vdmVtZW50LkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBib2FyZC5tb3ZlU2hhcGVMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5SaWdodDpcclxuICAgICAgICAgICAgICAgIGJvYXJkLm1vdmVTaGFwZVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBQbGF5ZXJNb3ZlbWVudC5Eb3duOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQubW92ZVNoYXBlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuRHJvcDpcclxuICAgICAgICAgICAgICAgIGlmIChib2FyZC5tb3ZlU2hhcGVEb3duQWxsVGhlV2F5KCkpIHsgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSBhcmUgaW4gYSBwb3NpdGlvbiB0byBtb3ZlIHRoZSBzaGFwZSBkb3duIGJlZm9yZSBleGVjdXRpbmcgdGhlIG5leHQgbGluZS4gXHJcbiAgICAgICAgICAgICAgICAgICAgYm9hcmQuaGFuZGxlRW5kT2ZDdXJyZW50UGllY2VUYXNrcygpOyAgIC8vIFByZXZlbnRzIGFueSBvdGhlciBrZXlzdHJva2VzIGFmZmVjdGluZyB0aGUgc2hhcGUgYWZ0ZXIgaXQgaGl0cyB0aGUgYm90dG9tLlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUGxheWVyTW92ZW1lbnQuUm90YXRlQ2xvY2t3aXNlOlxyXG4gICAgICAgICAgICAgICAgYm9hcmQucm90YXRlU2hhcGVDbG9ja3dpc2UoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuaGFuZGxlZCBtb3ZlbWVudCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmZXIgdGhlIGZpbGxlZCByb3dzIHRvIGJlIGp1bmsgcm93cyBvbiB0aGUgb3Bwb3NpdGUgcGxheWVyJ3MgYm9hcmQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGFuZGxlUm93c0ZpbGxlZEV2ZW50KGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQgPSB0aGlzLmRldGVybWluZUJvYXJkRm9yT3Bwb3NpdGVPZihldmVudC5wbGF5ZXJUeXBlKTtcclxuICAgICAgICBib2FyZC5hZGRKdW5rUm93cyhldmVudC5maWxsZWRSb3dJZHhzLmxlbmd0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVSb3dDbGVhckFuaW1hdGlvbkNvbXBsZXRlZEV2ZW50KGV2ZW50OiBSb3dzQ2xlYXJBbmltYXRpb25Db21wbGV0ZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBib2FyZCA9IHRoaXMuZGV0ZXJtaW5lQm9hcmRGb3IoZXZlbnQucGxheWVyVHlwZSk7XHJcbiAgICAgICAgYm9hcmQuaGFuZGxlQW55RmlsbGVkTGluZXNQYXJ0MigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaHVtYW4ncyBib2FyZCBpZiBnaXZlbiB0aGUgaHVtYW4ncyB0eXBlLCBvciBBSSdzIGJvYXJkIGlmIGdpdmVuIHRoZSBBSS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3IocGxheWVyVHlwZTogUGxheWVyVHlwZSk6IEJvYXJkIHtcclxuICAgICAgICBpZiAocGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhpcyBtZXRob2QgaXMgZ2l2ZW4gXCJIdW1hblwiLCBpdCB3aWxsIHJldHVybiB0aGUgQUkncyBib2FyZCwgYW5kIHZpY2UgdmVyc2EuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZGV0ZXJtaW5lQm9hcmRGb3JPcHBvc2l0ZU9mKHBsYXllclR5cGU6IFBsYXllclR5cGUpOiBCb2FyZCB7XHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuSHVtYW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWlCb2FyZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odW1hbkJvYXJkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUJvYXJkRmlsbGVkRXZlbnQoZXZlbnQ6IEJvYXJkRmlsbGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgYm9hcmQ6IEJvYXJkO1xyXG4gICAgICAgIGxldCBmYWxsaW5nU2VxdWVuY2VyOiBGYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgIGxldCBocDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5IdW1hbikge1xyXG4gICAgICAgICAgICBib2FyZCA9IHRoaXMuaHVtYW5Cb2FyZDtcclxuICAgICAgICAgICAgZmFsbGluZ1NlcXVlbmNlciA9IHRoaXMuaHVtYW5GYWxsaW5nU2VxdWVuY2VyO1xyXG4gICAgICAgICAgICBocCA9ICh2aXRhbHMuaHVtYW5IaXRQb2ludHMgLT0gMik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9hcmQgPSB0aGlzLmFpQm9hcmQ7XHJcbiAgICAgICAgICAgIGZhbGxpbmdTZXF1ZW5jZXIgPSB0aGlzLmFpRmFsbGluZ1NlcXVlbmNlcjtcclxuICAgICAgICAgICAgaHAgPSAodml0YWxzLmFpSGl0UG9pbnRzIC09IDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgSHBDaGFuZ2VkRXZlbnQoaHAsIGV2ZW50LnBsYXllclR5cGUsIHRydWUpKTtcclxuICAgICAgICAvLyBUT0RPOiBTZWUgaWYgb25lIG9mIHRoZSBwbGF5ZXJzIGhhcyBydW4gb3V0IG9mIEhQLCBzb21ld2hlcmUgaWYgbm90IGhlcmUuXHJcblxyXG4gICAgICAgIGV2ZW50QnVzLmZpcmUobmV3IEZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudC5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgZmFsbGluZ1NlcXVlbmNlci5yZXNldEFuZFBsYXkoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrRm9yRW5kT2ZHYW1lKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQuc3RhcnRpbmcgPT09IHRydWUgJiYgZXZlbnQucGxheWVyVHlwZSA9PT0gUGxheWVyVHlwZS5BaSkge1xyXG4gICAgICAgICAgICB0aGlzLmFpLnN0cmF0ZWdpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3RoaW5nIGN1cnJlbnRseSBmb3IgdGhlIGh1bWFuJ3MgYm9hcmQgdG8gYmUgZG9pbmcgYXQgdGhpcyB0aW1lLlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrRm9yRW5kT2ZHYW1lKCkge1xyXG4gICAgICAgIGlmICh2aXRhbHMuYWlIaXRQb2ludHMgPD0gMCB8fCB2aXRhbHMuaHVtYW5IaXRQb2ludHMgPD0gMCkge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUuc2V0Q3VycmVudChHYW1lU3RhdGVUeXBlLkVuZGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHBsYXlpbmdBY3Rpdml0eSA9IG5ldyBQbGF5aW5nQWN0aXZpdHkoKTsiLCJpbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG5leHBvcnQgY29uc3QgTUFYX0hQID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SOyAvLyBIUCBjb3JyZXNwb25kcyB0byB0aGUgbnVtYmVyIG9mIGxvbmcgd2luZG93cyBvbiB0aGUgc2Vjb25kIGZsb29yIG9mIHRoZSBwaHlzaWNhbCBidWlsZGluZy5cclxuXHJcbmNsYXNzIFZpdGFscyB7XHJcbiAgICBodW1hbkhpdFBvaW50czogbnVtYmVyO1xyXG4gICAgYWlIaXRQb2ludHM6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmh1bWFuSGl0UG9pbnRzID0gTUFYX0hQO1xyXG4gICAgICAgIHRoaXMuYWlIaXRQb2ludHMgPSBNQVhfSFA7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHZpdGFscyA9IG5ldyBWaXRhbHMoKTsiLCJpbXBvcnQge3N0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZX0gZnJvbSAnLi92aWV3L3N0YW5kZWUvc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlJztcclxuaW1wb3J0IHtidWlsZGluZ1ByZWxvYWRlcn0gZnJvbSAnLi92aWV3L2xpZ2h0aW5nL2J1aWxkaW5nLXByZWxvYWRlcic7XHJcbmltcG9ydCB7Z3JvdW5kfSBmcm9tICcuL3ZpZXcvd29ybGQvZ3JvdW5kJztcclxuaW1wb3J0IHtzb3VuZExvYWRlcn0gZnJvbSAnLi9zb3VuZC9zb3VuZC1sb2FkZXInO1xyXG5cclxuY2xhc3MgUHJlbG9hZGVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsb2FkaW5nRGl2OiBIVE1MRGl2RWxlbWVudDtcclxuICAgIHByaXZhdGUgbG9hZGluZ01lc3NhZ2U6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBsb2FkaW5nRXJyb3I6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBsb2FkaW5nQmFyOiBIVE1MUHJvZ3Jlc3NFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubG9hZGluZ0RpdiA9IDxIVE1MRGl2RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLmxvYWRpbmdNZXNzYWdlID0gPEhUTUxEaXZFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZy1tZXNzYWdlJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IgPSA8SFRNTERpdkVsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLWVycm9yJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nQmFyID0gPEhUTUxQcm9ncmVzc0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLWJhcicpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoc2lnbmFsUHJlbG9hZGluZ0NvbXBsZXRlOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICBsZXQgdG90YWwgPSAwO1xyXG5cclxuICAgICAgICBsZXQgY2FsbFdoZW5GaW5pc2hlZCA9IChzdWNjZXNzOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nTWVzc2FnZS50ZXh0Q29udGVudCA9ICdMb2FkZWQgJyArIGNvdW50ICsgJyBvZiAnICsgdG90YWwgKyAnIGZpeHR1cmVzLi4uJztcclxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbFByZWxvYWRpbmdDb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdCYXIuc2V0QXR0cmlidXRlKCd2YWx1ZScsIFN0cmluZyhjb3VudCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IudGV4dENvbnRlbnQgPSAnRXJyb3IgbG9hZGluZyBmaXh0dXJlcy4gUGxlYXNlIHJlbG9hZCBpZiB5b3Ugd291bGQgbGlrZSB0byByZXRyeS4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdG90YWwgKz0gc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLnByZWxvYWQoKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgY2FsbFdoZW5GaW5pc2hlZChzdWNjZXNzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdG90YWwgKz0gYnVpbGRpbmdQcmVsb2FkZXIucHJlbG9hZCgoc3VjY2VzczogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgICAgICBjYWxsV2hlbkZpbmlzaGVkKHN1Y2Nlc3MpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0b3RhbCArPSBncm91bmQucHJlbG9hZCgoc3VjY2VzczogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgICAgICBjYWxsV2hlbkZpbmlzaGVkKHN1Y2Nlc3MpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0b3RhbCArPSBzb3VuZExvYWRlci5wcmVsb2FkKChzdWNjZXNzOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxXaGVuRmluaXNoZWQoc3VjY2Vzcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubG9hZGluZ0Jhci5zZXRBdHRyaWJ1dGUoJ21heCcsIFN0cmluZyh0b3RhbCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmFkZU91dCgpIHtcclxuICAgICAgICB0aGlzLmxvYWRpbmdEaXYuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB0aGlzLmxvYWRpbmdEaXYuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfSwgMTI1MCk7IC8vIEp1c3QgYSBsaXR0bGUgYml0IGxvbmdlciB0aGFuIHRyYW5zaXRpb24gdGltZS5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWQgbW9yZSBmaXh0dXJlcyB0aGF0IHdpbGwgbm90IGJlIG5lZWRlZCBpbW1lZGlhdGVseS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkZWZlcnJlZExvYWQoKSB7XHJcbiAgICAgICAgc291bmRMb2FkZXIuZGVmZXJyZWRMb2FkKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IHByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKTsiLCJkZWNsYXJlIGNvbnN0IEhvd2w6IGFueTtcclxuXHJcbmltcG9ydCB7c291bmRNYW5hZ2VyfSBmcm9tICcuL3NvdW5kLW1hbmFnZXInO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEFNQklFTkNFX05JR0hULFxyXG4gICAgTVVTSUNfT1BFTklORyxcclxuICAgIE1VU0lDX01BSU4sXHJcbiAgICBNVVNJQ19NQUlOX1ZPWCxcclxuICAgIFNUVURFTlRTX1RBTEtJTkcsXHJcbiAgICBDSEVFUklORyxcclxuICAgIENMQVBQSU5HXHJcbn0gZnJvbSAnLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG4vLyAxKSBBbWJpZW5jZSAtIE5pZ2h0XHJcbi8vIDIpIE11c2ljIC0gT3BlbmluZ1xyXG5jb25zdCBGSUxFU19UT19QUkVMT0FEID0gMjtcclxuXHJcbmNsYXNzIFNvdW5kTG9hZGVyIHtcclxuXHJcbiAgICBwcmVsb2FkKHNpZ25hbE9uZUZpbGVMb2FkZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkKTogbnVtYmVyIHtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBhbWJpZW5jZU5pZ2h0SG93bCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgICAgIHNyYzogWydhbWJpZW5jZS1uaWdodC5tNGEnXSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC4zM1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYW1iaWVuY2VOaWdodEhvd2wub25jZSgnbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNvdW5kTWFuYWdlci5jYWNoZUhvd2woQU1CSUVOQ0VfTklHSFQsIGFtYmllbmNlTmlnaHRIb3dsKTtcclxuICAgICAgICAgICAgICAgIHNpZ25hbE9uZUZpbGVMb2FkZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhbWJpZW5jZU5pZ2h0SG93bC5vbmNlKCdsb2FkZXJyb3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzaWduYWxPbmVGaWxlTG9hZGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtdXNpY09wZW5pbmdIb3dsID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgc3JjOiBbJ211c2ljLW9wZW5pbmcubTRhJ10sXHJcbiAgICAgICAgICAgICAgICB2b2x1bWU6IDAuNVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbXVzaWNPcGVuaW5nSG93bC5vbmNlKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc291bmRNYW5hZ2VyLmNhY2hlSG93bChNVVNJQ19PUEVOSU5HLCBtdXNpY09wZW5pbmdIb3dsKTtcclxuICAgICAgICAgICAgICAgIHNpZ25hbE9uZUZpbGVMb2FkZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtdXNpY09wZW5pbmdIb3dsLm9uY2UoJ2xvYWRlcnJvcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNpZ25hbE9uZUZpbGVMb2FkZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBGSUxFU19UT19QUkVMT0FEO1xyXG4gICAgfVxyXG5cclxuICAgIGRlZmVycmVkTG9hZCgpIHtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtdXNpY01haW5Ib3dsID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgc3JjOiBbJ211c2ljLW1haW4ubTRhJ10sXHJcbiAgICAgICAgICAgICAgICB2b2x1bWU6IDAuN1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbXVzaWNNYWluSG93bC5vbmNlKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc291bmRNYW5hZ2VyLmNhY2hlSG93bChNVVNJQ19NQUlOLCBtdXNpY01haW5Ib3dsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtdXNpY01haW5Wb3hIb3dsID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgc3JjOiBbJ211c2ljLW1haW4tdm94Lm00YSddLFxyXG4gICAgICAgICAgICAgICAgdm9sdW1lOiAwLjdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG11c2ljTWFpblZveEhvd2wub25jZSgnbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNvdW5kTWFuYWdlci5jYWNoZUhvd2woTVVTSUNfTUFJTl9WT1gsIG11c2ljTWFpblZveEhvd2wpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHN0dWRlbnRzVGFsa2luZ0hvd2wgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6IFsnc3R1ZGVudHMtdGFsa2luZy5tNGEnXSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC4wXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzdHVkZW50c1RhbGtpbmdIb3dsLm9uY2UoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzb3VuZE1hbmFnZXIuY2FjaGVIb3dsKFNUVURFTlRTX1RBTEtJTkcsIHN0dWRlbnRzVGFsa2luZ0hvd2wpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGNoZWVyaW5nSG93bCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgICAgIHNyYzogWydjaGVlcmluZy5tNGEnXSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC4wXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGVlcmluZ0hvd2wub25jZSgnbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNvdW5kTWFuYWdlci5jYWNoZUhvd2woQ0hFRVJJTkcsIGNoZWVyaW5nSG93bCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY2xhcHBpbmdIb3dsID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgc3JjOiBbJ2NsYXBwaW5nLm00YSddLFxyXG4gICAgICAgICAgICAgICAgdm9sdW1lOiAwLjBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNsYXBwaW5nSG93bC5vbmNlKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc291bmRNYW5hZ2VyLmNhY2hlSG93bChDTEFQUElORywgY2xhcHBpbmdIb3dsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBzb3VuZExvYWRlciA9IG5ldyBTb3VuZExvYWRlcigpOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uLy4uLy4uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0L2xpYi9saWIuZXM2LmQudHMnLz5cclxuXHJcbmRlY2xhcmUgY29uc3QgSG93bGVyOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Qm9hcmRGaWxsZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvYm9hcmQtZmlsbGVkLWV2ZW50JztcclxuaW1wb3J0IHtHYW1lU3RhdGVUeXBlLCBnYW1lU3RhdGV9IGZyb20gJy4uL2dhbWUtc3RhdGUnO1xyXG5pbXBvcnQge0dhbWVTdGF0ZUNoYW5nZWRFdmVudH0gZnJvbSAnLi4vZXZlbnQvZ2FtZS1zdGF0ZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtcclxuICAgIFRJTUVfVU5USUxfRVZFUllPTkVfT05fU0NSRUVOLFxyXG4gICAgQU1CSUVOQ0VfTklHSFQsXHJcbiAgICBNVVNJQ19PUEVOSU5HLFxyXG4gICAgTVVTSUNfTUFJTixcclxuICAgIE1VU0lDX01BSU5fVk9YLFxyXG4gICAgU1RVREVOVFNfVEFMS0lORyxcclxuICAgIENIRUVSSU5HLFxyXG4gICAgQ0xBUFBJTkdcclxufSBmcm9tICcuLi9kb21haW4vY29uc3RhbnRzJztcclxuaW1wb3J0IHtQbGF5ZXJUeXBlfSBmcm9tICcuLi9kb21haW4vcGxheWVyLXR5cGUnO1xyXG5cclxuY29uc3QgU09VTkRfS0VZID0gJzEyOTA4MzE5MC1mYWxsaW5nLXNvdW5kJztcclxuXHJcbmNvbnN0IE1VU0lDX0ZBREVfT1VUX1RJTUVfTVMgPSAxNSAqIDEwMDA7XHJcblxyXG5jbGFzcyBTb3VuZE1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgc291bmRUb2dnbGVTZWN0aW9uOiBIVE1MRGl2RWxlbWVudDtcclxuICAgIHByaXZhdGUgc291bmRUb2dnbGVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIHByaXZhdGUgaG93bHM6IE1hcDxzdHJpbmcsIGFueT47IC8vIGFueSA9IEhvd2xcclxuXHJcbiAgICBwcml2YXRlIGNyb3dkTm9pc2VFbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNyb3dkVm9sdW1lOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBtdXNpY0VuZGluZ1R0bDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBtdXNpY1ZvbHVtZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc291bmRUb2dnbGVTZWN0aW9uID0gPEhUTUxEaXZFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc291bmQtdG9nZ2xlLXNlY3Rpb24nKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvdW5kLXRvZ2dsZScpO1xyXG4gICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU291bmRTZXR0aW5nKCF0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5jaGVja2VkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmhvd2xzID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5jcm93ZE5vaXNlRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5jcm93ZFZvbHVtZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubXVzaWNFbmRpbmdUdGwgPSBNVVNJQ19GQURFX09VVF9USU1FX01TO1xyXG4gICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdWxkIG9jY3VyIGJlZm9yZSBwcmVsb2FkaW5nIHNvIHRoZSBwbGF5ZXIgc2VlcyB0aGUgcmlnaHQgb3B0aW9uIGltbWVkaWF0ZWx5LlxyXG4gICAgICovXHJcbiAgICBhdHRhY2goKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTb3VuZFNldHRpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuR2FtZVN0YXRlQ2hhbmdlZFR5cGUsIChldmVudDogR2FtZVN0YXRlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQuZ2FtZVN0YXRlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLkludHJvOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VlSW50cm9Tb3VuZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgR2FtZVN0YXRlVHlwZS5QbGF5aW5nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VlUGxheWluZ1NvdW5kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHYW1lU3RhdGVUeXBlLkVuZGVkOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFkZU91dFNvdW5kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5Cb2FyZEZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBCb2FyZEZpbGxlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpID09PSBHYW1lU3RhdGVUeXBlLlBsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheUJvYXJkRmlsbGVkUmVhY3Rpb24oZXZlbnQucGxheWVyVHlwZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUuZ2V0Q3VycmVudCgpID09PSBHYW1lU3RhdGVUeXBlLlBsYXlpbmcpIHtcclxuICAgICAgICAgICAgLy8gSW5jcmVhc2UgdGhlIGNyb3dkIHZvbHVtZSBiYXNlZCBvbiBob3cgbG9uZyBpdCBoYXMgYmVlbiBwbGF5aW5nLCB1cCB0byBhIGxpdHRsZSBsZXNzIHRoYW4gaGFsZndheS5cclxuICAgICAgICAgICAgbGV0IHN0dWRlbnRzVGFsa2luZ0hvd2wgPSB0aGlzLmhvd2xzLmdldChTVFVERU5UU19UQUxLSU5HKTtcclxuICAgICAgICAgICAgaWYgKHN0dWRlbnRzVGFsa2luZ0hvd2wgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzVGFsa2luZ0hvd2wucGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm93ZE5vaXNlRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Jvd2RWb2x1bWUgPSAodGhpcy5jcm93ZE5vaXNlRWxhcHNlZCAvIChUSU1FX1VOVElMX0VWRVJZT05FX09OX1NDUkVFTi8yKSkgKiAwLjQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3Jvd2RWb2x1bWUgPiAwLjQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm93ZFZvbHVtZSA9IDAuNDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUYWxraW5nSG93bC52b2x1bWUodGhpcy5jcm93ZFZvbHVtZSk7IC8vIFNlZW1zLi4uIG9rLi4uIHRvIGNhbGwgdGhpcyByZXBlYXRlZGx5Li4uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE1haW4gbXVzaWMgdm9sdW1lIGlzIGNvbnN0YW50XHJcbiAgICAgICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSAwLjc7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlLmdldEN1cnJlbnQoKSA9PT0gR2FtZVN0YXRlVHlwZS5FbmRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljRW5kaW5nVHRsIC09IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm11c2ljRW5kaW5nVHRsIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tdXNpY0VuZGluZ1R0bCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tdXNpY1ZvbHVtZSA9ICh0aGlzLm11c2ljRW5kaW5nVHRsIC8gTVVTSUNfRkFERV9PVVRfVElNRV9NUykgKiAwLjc7IC8vIDAuNyBpcyBmcm9tIGNvbnN0YW50IHNlZW4gYWJvdmVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBtdXNpY01haW5Ib3dsID0gdGhpcy5ob3dscy5nZXQoTVVTSUNfTUFJTik7XHJcbiAgICAgICAgICAgIGlmIChtdXNpY01haW5Ib3dsICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIG11c2ljTWFpbkhvd2wudm9sdW1lKHRoaXMubXVzaWNWb2x1bWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbXVzaWNNYWluSG93bFZveCA9IHRoaXMuaG93bHMuZ2V0KE1VU0lDX01BSU5fVk9YKTtcclxuICAgICAgICAgICAgaWYgKG11c2ljTWFpbkhvd2xWb3ggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbXVzaWNNYWluSG93bFZveC52b2x1bWUodGhpcy5tdXNpY1ZvbHVtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FjaGVIb3dsKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7IC8vIGFueSA9IEhvd2xcclxuICAgICAgICB0aGlzLmhvd2xzLnNldChrZXksIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnQgMiBpcyBkb25lIG9mZiB0aGUgbWFpbiBleGVjdXRpb24gcGF0aCwgaW4gY2FzZSB0aGUgdXNlciBoYXMgY2xpZW50LXNpZGUgc3RvcmFnZSB0dXJuZWQgb2ZmLlxyXG4gICAgICovICAgIFxyXG4gICAgcHJpdmF0ZSB1cGRhdGVTb3VuZFNldHRpbmcobXV0ZT86IGJvb2xlYW4pIHtcclxuICAgICAgICAvLyBQYXJ0IDE6IFVwZGF0ZSBIb3dsZXJcclxuICAgICAgICBpZiAobXV0ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgdG8gc291bmQgb24sIGluIGNhc2UgdGhlIHNlY29uZCBwYXJ0IGZhaWxzLlxyXG4gICAgICAgICAgICB0aGlzLnNvdW5kVG9nZ2xlRWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc291bmRWYWx1ZTogc3RyaW5nO1xyXG4gICAgICAgICAgICBpZiAobXV0ZSkge1xyXG4gICAgICAgICAgICAgICAgc291bmRWYWx1ZSA9ICdvZmYnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc291bmRWYWx1ZSA9ICdvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgSG93bGVyLm11dGUobXV0ZSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQYXJ0IDI6IFVwZGF0ZSBzZXNzaW9uIHN0b3JhZ2VcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZFRvZ2dsZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICBpZiAobXV0ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc291bmRWYWx1ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oU09VTkRfS0VZKTtcclxuICAgICAgICAgICAgICAgIGlmIChzb3VuZFZhbHVlID09PSAnb2ZmJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc291bmRUb2dnbGVFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBIb3dsZXIubXV0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzb3VuZFZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAobXV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvdW5kVmFsdWUgPSAnb2ZmJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc291bmRWYWx1ZSA9ICdvbic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFNPVU5EX0tFWSwgc291bmRWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGN1ZUludHJvU291bmRzKCkge1xyXG4gICAgICAgIGxldCBhbWJpZW5jZU5pZ2h0SG93bCA9IHRoaXMuaG93bHMuZ2V0KEFNQklFTkNFX05JR0hUKTtcclxuICAgICAgICBhbWJpZW5jZU5pZ2h0SG93bC5sb29wKHRydWUpO1xyXG4gICAgICAgIGFtYmllbmNlTmlnaHRIb3dsLnBsYXkoKTtcclxuXHJcbiAgICAgICAgbGV0IG11c2ljT3BlbmluZ0hvd2wgPSB0aGlzLmhvd2xzLmdldChNVVNJQ19PUEVOSU5HKTtcclxuICAgICAgICBtdXNpY09wZW5pbmdIb3dsLmxvb3AodHJ1ZSk7XHJcbiAgICAgICAgbXVzaWNPcGVuaW5nSG93bC5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPbmNlIGxvYWRlZCwgaGF2ZSB0aGUgbWFpbiBtdXNpYyBwbGF5IGFmdGVyIHRoZSBpbnRybyBtdXNpYyBjb21wbGV0ZXMgaXRzIGN1cnJlbnQgbG9vcC5cclxuICAgICAqIEFsc28gaGF2ZSB0aGUgc3R1ZGVudHMgdGFsa2luZyBzdGFydCB0byBwbGF5LlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGN1ZVBsYXlpbmdTb3VuZHMoKSB7XHJcbiAgICAgICAgbGV0IG11c2ljTWFpbkhvd2wgPSB0aGlzLmhvd2xzLmdldChNVVNJQ19NQUlOKTtcclxuICAgICAgICBsZXQgbXVzaWNNYWluSG93bFZveCA9IHRoaXMuaG93bHMuZ2V0KE1VU0lDX01BSU5fVk9YKTtcclxuICAgICAgICBpZiAobXVzaWNNYWluSG93bCAhPSBudWxsICYmIG11c2ljTWFpbkhvd2xWb3ggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgbXVzaWNPcGVuaW5nSG93bCA9IHRoaXMuaG93bHMuZ2V0KE1VU0lDX09QRU5JTkcpO1xyXG4gICAgICAgICAgICBtdXNpY09wZW5pbmdIb3dsLmxvb3AoZmFsc2UpO1xyXG4gICAgICAgICAgICBtdXNpY09wZW5pbmdIb3dsLm9uY2UoJ2VuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIG11c2ljT3BlbmluZ0hvd2wudW5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYWluTXVzaWNNYWluKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWxzbyBzdGFydCB0aGUgc3R1ZGVudHMgdGFsa2luZy5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VlU3R1ZGVudHNUYWxraW5nU291bmRzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gYSBzZWNvbmQuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jdWVQbGF5aW5nU291bmRzKCksIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IHRoaXMgYXQgYSB6ZXJvIHZvbHVtZSBhbmQgZ3JhZHVhbGx5IGluY3JlYXNlIHRvIGFib3V0IGhhbGYgdm9sdW1lLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGN1ZVN0dWRlbnRzVGFsa2luZ1NvdW5kcygpIHtcclxuICAgICAgICBsZXQgc3R1ZGVudHNUYWxraW5nSG93bCA9IHRoaXMuaG93bHMuZ2V0KFNUVURFTlRTX1RBTEtJTkcpO1xyXG4gICAgICAgIGlmIChzdHVkZW50c1RhbGtpbmdIb3dsICE9IG51bGwpIHtcclxuICAgICAgICAgICAgc3R1ZGVudHNUYWxraW5nSG93bC5sb29wKHRydWUpO1xyXG4gICAgICAgICAgICBzdHVkZW50c1RhbGtpbmdIb3dsLnBsYXkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBOb3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGEgc2Vjb25kLlxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY3VlU3R1ZGVudHNUYWxraW5nU291bmRzKCksIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoYWluTXVzaWNNYWluKCkge1xyXG4gICAgICAgIGxldCBtdXNpY01haW5Ib3dsID0gdGhpcy5ob3dscy5nZXQoTVVTSUNfTUFJTik7XHJcbiAgICAgICAgbGV0IG11c2ljTWFpbkhvd2xWb3ggPSB0aGlzLmhvd2xzLmdldChNVVNJQ19NQUlOX1ZPWCk7XHJcblxyXG4gICAgICAgIG11c2ljTWFpbkhvd2wudm9sdW1lKHRoaXMubXVzaWNWb2x1bWUpO1xyXG4gICAgICAgIG11c2ljTWFpbkhvd2wucGxheSgpO1xyXG4gICAgICAgIG11c2ljTWFpbkhvd2wub25jZSgnZW5kJywgKCkgPT4gdGhpcy5jaGFpbk11c2ljTWFpblZveCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoYWluTXVzaWNNYWluVm94KCkge1xyXG4gICAgICAgIGxldCBtdXNpY01haW5Ib3dsID0gdGhpcy5ob3dscy5nZXQoTVVTSUNfTUFJTik7XHJcbiAgICAgICAgbGV0IG11c2ljTWFpbkhvd2xWb3ggPSB0aGlzLmhvd2xzLmdldChNVVNJQ19NQUlOX1ZPWCk7XHJcblxyXG4gICAgICAgIG11c2ljTWFpbkhvd2xWb3gudm9sdW1lKHRoaXMubXVzaWNWb2x1bWUpO1xyXG4gICAgICAgIG11c2ljTWFpbkhvd2xWb3gucGxheSgpO1xyXG4gICAgICAgIG11c2ljTWFpbkhvd2xWb3gub25jZSgnZW5kJywgKCkgPT4gdGhpcy5jaGFpbk11c2ljTWFpbigpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBsYXlCb2FyZEZpbGxlZFJlYWN0aW9uKHBsYXllclR5cGU6IFBsYXllclR5cGUpIHtcclxuICAgICAgICAvLyBOb3RlOiBTY2FsaW5nIHZvbHVtZSBoZXJlIHRvIG51bWJlciBvZiBOUENzIGluIHBsYXkuXHJcblxyXG4gICAgICAgIGNvbnN0IG1heFZvbHVtZSA9IDAuOTtcclxuXHJcbiAgICAgICAgaWYgKHBsYXllclR5cGUgPT09IFBsYXllclR5cGUuQWkpIHtcclxuICAgICAgICAgICAgLy8gQ2hlZXJpbmcgZm9yIEFJJ3MgYm9hcmQgZmFsbGluZy5cclxuICAgICAgICAgICAgbGV0IGNoZWVyaW5nSG93bCA9IHRoaXMuaG93bHMuZ2V0KENIRUVSSU5HKTtcclxuICAgICAgICAgICAgaWYgKGNoZWVyaW5nSG93bCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdm9sdW1lID0gKHRoaXMuY3Jvd2ROb2lzZUVsYXBzZWQgLyAoVElNRV9VTlRJTF9FVkVSWU9ORV9PTl9TQ1JFRU4vMikpICogbWF4Vm9sdW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZvbHVtZSA+IG1heFZvbHVtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZSA9IG1heFZvbHVtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoZWVyaW5nSG93bC52b2x1bWUodm9sdW1lKTtcclxuICAgICAgICAgICAgICAgIGNoZWVyaW5nSG93bC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBDbGFwcGluZyBmb3IgSHVtYW4ncyBib2FyZCBmYWxsaW5nLlxyXG4gICAgICAgICAgICBsZXQgY2xhcHBpbmdIb3dsID0gdGhpcy5ob3dscy5nZXQoQ0xBUFBJTkcpO1xyXG4gICAgICAgICAgICBpZiAoY2xhcHBpbmdIb3dsICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2b2x1bWUgPSAodGhpcy5jcm93ZE5vaXNlRWxhcHNlZCAvIChUSU1FX1VOVElMX0VWRVJZT05FX09OX1NDUkVFTi8yKSkgKiBtYXhWb2x1bWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodm9sdW1lID4gbWF4Vm9sdW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm9sdW1lID0gbWF4Vm9sdW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xhcHBpbmdIb3dsLnZvbHVtZSh2b2x1bWUpO1xyXG4gICAgICAgICAgICAgICAgY2xhcHBpbmdIb3dsLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1aWNrIGhhY2sganVzdCB0byBnZXQgaXQgZG9uZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBmYWRlT3V0U291bmRzKCkge1xyXG4gICAgICAgIGxldCBzdHVkZW50c1RhbGtpbmdIb3dsID0gdGhpcy5ob3dscy5nZXQoU1RVREVOVFNfVEFMS0lORyk7XHJcbiAgICAgICAgaWYgKHN0dWRlbnRzVGFsa2luZ0hvd2wgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHVkZW50c1RhbGtpbmdIb3dsLmZhZGUodGhpcy5jcm93ZFZvbHVtZSwgMC4wLCAzMCAqIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcigpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuY29uc3QgQVNQRUNUX1JBVElPID0gMTYvOTtcclxuXHJcbmNvbnN0IFBBTl9USU1FX01TID0gNTUwMDtcclxuY29uc3Qgc3RhcnRpbmdGb2N1cyA9IG5ldyBUSFJFRS5WZWN0b3IzKDksIDcuNSwgMik7XHJcbmNvbnN0IHBsYXlpbmdGb2N1cyA9IG5ldyBUSFJFRS5WZWN0b3IzKDYsIDYuNSwgMik7XHJcblxyXG5jbGFzcyBQYW5HdWlkZSB7XHJcbiAgICBlbGFwc2VkOiBudW1iZXI7XHJcbiAgICBwYW5Gb2N1cyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbn1cclxuXHJcbmNsYXNzIENhbWVyYVdyYXBwZXIge1xyXG4gICAgXHJcbiAgICByZWFkb25seSBjYW1lcmE6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhblR3ZWVuOiBhbnk7XHJcbiAgICBwcml2YXRlIHBhbkd1aWRlOiBQYW5HdWlkZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg2MCwgQVNQRUNUX1JBVElPLCAwLjEsIDEwMDApO1xyXG4gICAgICAgIHRoaXMucGFuVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucGFuR3VpZGUgPSBuZXcgUGFuR3VpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2FybmluZzogb25Db21wbGV0ZSgpIGNhbiBzZXQgdGhlIHR3ZWVuIHRvIG51bGwuXHJcbiAgICAgKi9cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFuVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnBhbkd1aWRlLmVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5wYW5Ud2Vlbi51cGRhdGUodGhpcy5wYW5HdWlkZS5lbGFwc2VkKTtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHRoaXMucGFuR3VpZGUucGFuRm9jdXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVSZW5kZXJlclNpemUocmVuZGVyZXI6IGFueSkge1xyXG4gICAgICAgIGxldCB3aW5kb3dBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIGxldCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICBpZiAod2luZG93QXNwZWN0UmF0aW8gPiBBU1BFQ1RfUkFUSU8pIHtcclxuICAgICAgICAgICAgLy8gVG9vIHdpZGU7IHNjYWxlIG9mZiBvZiB3aW5kb3cgaGVpZ2h0LlxyXG4gICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogQVNQRUNUX1JBVElPKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93QXNwZWN0UmF0aW8gPD0gQVNQRUNUX1JBVElPKSB7XHJcbiAgICAgICAgICAgIC8vIFRvbyBuYXJyb3cgb3IganVzdCByaWdodDsgc2NhbGUgb2ZmIG9mIHdpbmRvdyB3aWR0aC5cclxuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAvIEFTUEVDVF9SQVRJTyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIC8vIFNob3VsZCBiZSBubyBuZWVkIHRvIHVwZGF0ZSBhc3BlY3QgcmF0aW8gYmVjYXVzZSBpdCBzaG91bGQgYmUgY29uc3RhbnQuXHJcbiAgICAgICAgLy8gdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvb2tBdFN0YXJ0aW5nRm9jdXMoKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHN0YXJ0aW5nRm9jdXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhblRvUGxheWluZ0ZvY3VzKCkge1xyXG4gICAgICAgIHRoaXMucGFuR3VpZGUucGFuRm9jdXMueCA9IHN0YXJ0aW5nRm9jdXMueDtcclxuICAgICAgICB0aGlzLnBhbkd1aWRlLnBhbkZvY3VzLnkgPSBzdGFydGluZ0ZvY3VzLnk7XHJcbiAgICAgICAgdGhpcy5wYW5HdWlkZS5wYW5Gb2N1cy56ID0gc3RhcnRpbmdGb2N1cy56O1xyXG4gICAgICAgIHRoaXMucGFuR3VpZGUuZWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5wYW5Ud2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLnBhbkd1aWRlLnBhbkZvY3VzKVxyXG4gICAgICAgICAgICAudG8oe3g6IHBsYXlpbmdGb2N1cy54LCB5OiBwbGF5aW5nRm9jdXMueSwgejogcGxheWluZ0ZvY3VzLnp9LCBQQU5fVElNRV9NUylcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuU2ludXNvaWRhbC5PdXQpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFuVHdlZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHBsYXlpbmdGb2N1cyk7IC8vIFRPRE86IE1pZ2h0IG5vdCBiZSBuZWNlc3NhcnkuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGFydCh0aGlzLnBhbkd1aWRlLmVsYXBzZWQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBjYW1lcmFXcmFwcGVyID0gbmV3IENhbWVyYVdyYXBwZXIoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBtdGwgYW5kIG9iaiA9IDIgZmlsZXMuXHJcbmNvbnN0IEZJTEVTX1RPX1BSRUxPQUQgPSAyO1xyXG5cclxuY2xhc3MgQnVpbGRpbmdQcmVsb2FkZXIge1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGluc3RhbmNlczogYW55W107XHJcbiAgICBwcml2YXRlIGluc3RhbmNlc1JlcXVlc3RlZDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXNSZXF1ZXN0ZWQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoc2lnbmFsT25lRmlsZUxvYWRlZDogKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBtdGxMb2FkZXIgPSBuZXcgVEhSRUUuTVRMTG9hZGVyKCk7XHJcbiAgICAgICAgbXRsTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgIG10bExvYWRlci5sb2FkKCdncmVlbi1idWlsZGluZy5tdGwnLCAobWF0ZXJpYWxzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWxzLnByZWxvYWQoKTtcclxuICAgICAgICAgICAgc2lnbmFsT25lRmlsZUxvYWRlZCh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvYmpMb2FkZXIgPSBuZXcgVEhSRUUuT0JKTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRNYXRlcmlhbHMobWF0ZXJpYWxzKTtcclxuICAgICAgICAgICAgb2JqTG9hZGVyLnNldFBhdGgoJycpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIubG9hZCgnZ3JlZW4tYnVpbGRpbmcub2JqJywgKG9iajogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5wdXNoKG9iaik7XHJcbiAgICAgICAgICAgICAgICBzaWduYWxPbmVGaWxlTG9hZGVkKHRydWUpO1xyXG4gICAgICAgICAgICB9LCB1bmRlZmluZWQsICgpID0+IHsgc2lnbmFsT25lRmlsZUxvYWRlZChmYWxzZSk7IH0pO1xyXG4gICAgICAgIH0sIHVuZGVmaW5lZCwgKCkgPT4geyBzaWduYWxPbmVGaWxlTG9hZGVkKGZhbHNlKTsgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBGSUxFU19UT19QUkVMT0FEO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXRJbnN0YW5jZSgpOiBhbnkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZTogYW55O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZXNSZXF1ZXN0ZWQgPT09IDApIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlc1swXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzWzBdLmNsb25lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc3RhbmNlc1JlcXVlc3RlZCsrO1xyXG5cclxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGJ1aWxkaW5nUHJlbG9hZGVyID0gbmV3IEJ1aWxkaW5nUHJlbG9hZGVyKCk7IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5cclxuaW1wb3J0IHtidWlsZGluZ1ByZWxvYWRlcn0gZnJvbSAnLi9idWlsZGluZy1wcmVsb2FkZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nIHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBsZXQgb2JqID0gYnVpbGRpbmdQcmVsb2FkZXIuZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICBvYmouc2NhbGUuc2V0U2NhbGFyKDAuMjUpO1xyXG4gICAgICAgIG9iai5wb3NpdGlvbi5zZXQoNSwgLTAuMDEsIDApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKG9iaik7XHJcblxyXG4gICAgICAgIC8vIFF1aWNrIGhhY2sgdG8gcHJldmVudCBidWlsZGluZyBmcm9tIGJlaW5nIHNlZS10aHJvdWdoLlxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDksIDMpO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogMHgzNDMzMzB9KTtcclxuICAgICAgICBsZXQgd2FsbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAgICAgd2FsbC5wb3NpdGlvbi5zZXQoNSwgMSwgLTMuNSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHdhbGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtQQU5FTF9DT1VOVF9QRVJfRkxPT1J9IGZyb20gJy4uLy4uL2RvbWFpbi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgTUFYX0NVUlRBSU5fQ09VTlQgPSA0O1xyXG5jb25zdCBDVVJUQUlOX1dJRFRIID0gUEFORUxfQ09VTlRfUEVSX0ZMT09SO1xyXG5jb25zdCBDVVJUQUlOX01PVkVfVElNRSA9IDc1MDtcclxuXHJcbmNsYXNzIEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbiB7XHJcbiAgICB4ID0gMDtcclxuICAgIGVsYXBzZWQgPSAwO1xyXG59XHJcblxyXG4vKipcclxuICogSSBtaWdodCBoYXZlIHNvbWUgb2YgdGhlc2UgYmFja3dhcmRzLi4uXHJcbiAqL1xyXG5leHBvcnQgZW51bSBDdXJ0YWluRGlyZWN0aW9uIHtcclxuICAgIE9wZW5MZWZ0VG9SaWdodCxcclxuICAgIE9wZW5SaWdodFRvTGVmdCxcclxuICAgIENsb3NlTGVmdFRvUmlnaHQsXHJcbiAgICBDbG9zZVJpZ2h0VG9MZWZ0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb21lIG5vdGVzIG9uIHZlcnRpY2VzIHdpdGhpbiBlYWNoIGN1cnRhaW4gbWVzaCB3aXRob3V0IG1vZGlmaWNhdGlvbnM6XHJcbiAqIFZlcnRpY2VzIDEgYW5kIDMgc2hvdWxkIHJlc3QgYXQgeCA9IC1DVVJUQUlOX1dJRFRIIC8gMiAoaG91c2UgbGVmdClcclxuICogVmVydGljZXMgMCBhbmQgMiBzaG91bGQgcmVzdCBhdCB4ID0gIENVUlRBSU5fV0lEVEggLyAyIChob3VzZSByaWdodClcclxuICogXHJcbiAqIEV4YW1wbGUgc3RhdGVtZW50czpcclxuICogY29uc29sZS5sb2coJ3ZlcnRpY2VzIDEgYW5kIDMgeDogJyArIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMV0ueCwgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1szXS54KTtcclxuICogY29uc29sZS5sb2coJ3ZlcnRpY2VzIDAgYW5kIDIgeDogJyArIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMF0ueCwgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1syXS54KTtcclxuICogY29uc29sZS5sb2coJy0tLScpO1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEN1cnRhaW4ge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBjdXJ0YWluczogYW55W107XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJ0YWluVmVydGV4UG9zaXRpb246IEN1cnRhaW5WZXJ0ZXhQb3NpdGlvbjtcclxuICAgIHByaXZhdGUgY3VydGFpblR3ZWVuOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuY3VydGFpbnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgTUFYX0NVUlRBSU5fQ09VTlQ7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KENVUlRBSU5fV0lEVEgsIDEpO1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe2NvbG9yOiAweDA3MDcxNn0pOyAvLyBNaWRuaWdodCBCbHVlXHJcbiAgICAgICAgICAgIGxldCBjdXJ0YWluID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWlucy5wdXNoKGN1cnRhaW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24gPSBuZXcgQ3VydGFpblZlcnRleFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IGN1cnRhaW4gb2YgdGhpcy5jdXJ0YWlucykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmFkZChjdXJ0YWluKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSBncm91cCB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCg1LjAsIDQuNzUsIC0xLjQ1MSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5zY2FsZS5zZXQoMC43LCAxLjAsIDEpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnRhaW5Ud2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5jdXJ0YWluVHdlZW4udXBkYXRlKHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydEFuaW1hdGlvbihmbG9vcklkeHM6IG51bWJlcltdLCBkaXJlY3Rpb246IEN1cnRhaW5EaXJlY3Rpb24sIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgYW5pbWF0aW9ucyBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICAgIGlmICh0aGlzLmN1cnRhaW5Ud2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcEN1cnRhaW4oZmxvb3JJZHhzKTtcclxuXHJcbiAgICAgICAgbGV0IHhlbmQ6IG51bWJlcjtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlTGVmdFRvUmlnaHQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54ID0gQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIHhlbmQgPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VSaWdodFRvTGVmdCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLnggPSAtQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIHhlbmQgPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLmVsYXBzZWQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnRhaW5Ud2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHt4OiB4ZW5kfSwgQ1VSVEFJTl9NT1ZFX1RJTUUpXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLlF1YXJ0aWMuSW5PdXQpXHJcbiAgICAgICAgICAgIC5vblVwZGF0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWUgbm90ZSBhdCB0b3AgYWJvdXQgd2h5IGlkeDEgYW5kIGlkeDIgYXJlIHdoYXQgdGhleSBhcmUuXHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4MTogbnVtYmVyLCBpZHgyOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQgfHwgZGlyZWN0aW9uID09PSBDdXJ0YWluRGlyZWN0aW9uLk9wZW5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDEgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDIgPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VMZWZ0VG9SaWdodCB8fCBkaXJlY3Rpb24gPT09IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4MiA9IDM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzW2lkeDFdLnggPSB0aGlzLmN1cnRhaW5WZXJ0ZXhQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbaWR4Ml0ueCA9IHRoaXMuY3VydGFpblZlcnRleFBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7IHRoaXMuY29tcGxldGVBbmltYXRpb24oY2FsbGJhY2spOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5jdXJ0YWluVmVydGV4UG9zaXRpb24uZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHRoZSByZXF1ZXN0ZWQgbnVtYmVyIG9mIGN1cnRhaW5zIHZpc2libGUuXHJcbiAgICAgKiBQb3NpdGlvbiB0aGVtIG9uIHRoZSByZXF1ZXN0ZWQgZmxvb3JzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRyb3BDdXJ0YWluKGZsb29ySWR4czogbnVtYmVyW10pIHtcclxuICAgICAgICBmb3IgKGxldCBjdXJ0YWluIG9mIHRoaXMuY3VydGFpbnMpIHtcclxuICAgICAgICAgICAgY3VydGFpbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBmbG9vcklkeHMubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgICAgICBsZXQgZmxvb3JJZHggPSBmbG9vcklkeHNbaWR4XTtcclxuICAgICAgICAgICAgbGV0IGN1cnRhaW4gPSB0aGlzLmN1cnRhaW5zW2lkeF07XHJcblxyXG4gICAgICAgICAgICBjdXJ0YWluLnBvc2l0aW9uLnNldCgwLCBmbG9vcklkeCwgMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWUgbm90ZSBhdCB0b3AgYWJvdXQgd2h5IHRoZXNlIGFyZSB3aGVyZSB0aGV5IGFyZS5cclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1swXS54ID0gLUNVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnggPSAgQ1VSVEFJTl9XSURUSCAvIDI7XHJcbiAgICAgICAgICAgIGN1cnRhaW4uZ2VvbWV0cnkudmVydGljZXNbMl0ueCA9IC1DVVJUQUlOX1dJRFRIIC8gMjtcclxuICAgICAgICAgICAgY3VydGFpbi5nZW9tZXRyeS52ZXJ0aWNlc1szXS54ID0gIENVUlRBSU5fV0lEVEggLyAyO1xyXG4gICAgICAgICAgICBjdXJ0YWluLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjdXJ0YWluLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbXBsZXRlQW5pbWF0aW9uKGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VydGFpblR3ZWVuID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7SHBPcmllbnRhdGlvbn0gZnJvbSAnLi4vLi4vZG9tYWluL2hwLW9yaWVudGF0aW9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBIcFBhbmVscyB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsczogYW55W107XHJcblxyXG4gICAgY29uc3RydWN0b3IoaHBPcmllbnRhdGlvbjogSHBPcmllbnRhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBQQU5FTF9DT1VOVF9QRVJfRkxPT1I7IGlkeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDAuNiwgMC42KTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCk7XHJcbiAgICAgICAgICAgIGxldCBwYW5lbCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgeDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoaHBPcmllbnRhdGlvbiA9PT0gSHBPcmllbnRhdGlvbi5EZWNyZWFzZXNSaWdodFRvTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgeCA9IGlkeDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHggPSBQQU5FTF9DT1VOVF9QRVJfRkxPT1IgLSBpZHggLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgICAgICBwYW5lbC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcbiAgICAgICAgICAgIHBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IE1ha2UgdGhpcyBwdWxzZSBhdCBhbGw/XHJcbiAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleCgweGVlZWUwMCk7XHJcbiAgICAgICAgICAgIHBhbmVsLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gMC41O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYW5lbHMucHVzaChwYW5lbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGZvciAobGV0IHBhbmVsIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuYWRkKHBhbmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgxLjg1LCAzLjU1LCAtMS41KTtcclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjcsIDEuOSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSHAoUEFORUxfQ09VTlRfUEVSX0ZMT09SLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFAgYmFyIGNhbiBnbyBmcm9tIHJpZ2h0LXRvLWxlZnQgb3IgbGVmdC10by1yaWdodCwgbGlrZSBhIGZpZ2h0aW5nIGdhbWUgSFAgYmFyLlxyXG4gICAgICogXCJibGlua0xvc3RcIiBtZWFucyB0byBhbmltYXRlIHRoZSBsb3NzIG9mIHRoZSBIUCBwYW5lbHMgZGlyZWN0bHkgYWJvdmUuXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIsIGJsaW5rTG9zdDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChocCA+IFBBTkVMX0NPVU5UX1BFUl9GTE9PUikge1xyXG4gICAgICAgICAgICBocCA9IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHRoaXMucGFuZWxzLmxlbmd0aDsgaWR4KyspIHtcclxuICAgICAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbaWR4XTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpZHggPCBocCkge1xyXG4gICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJsaW5rIHRoZSBsb3N0IHBhbmVscywgaWYgYW55LCB0byBnaXZlIHRoZSBwbGF5ZXIgdGhlIGltcHJlc3Npb24gdGhhdCB0aGV5IGxvc3Qgc29tZXRoaW5nLlxyXG4gICAgICAgIGlmIChibGlua0xvc3QgPT09IHRydWUgJiYgaHAgPj0gMCAmJiBocCA8IHRoaXMucGFuZWxzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgbGV0IGlkeCA9IGhwOyAvLyBBcyBpbiB0aGUgbmV4dCBpbmRleCB1cCBmcm9tIHRoZSBjdXJyZW50IEhQIGluZGV4LCBzaW5jZSBhcnJheSBzdGFydCBhdCAwLlxyXG4gICAgICAgICAgICBsZXQgcGFuZWwxID0gdGhpcy5wYW5lbHNbaWR4XTtcclxuICAgICAgICAgICAgbGV0IHBhbmVsMiA9IHRoaXMucGFuZWxzW2lkeCArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IGJsaW5rSGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwxLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbDIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoYmxpbmtIYW5kbGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbDEudmlzaWJsZSA9ICFwYW5lbDEudmlzaWJsZTtcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbDIudmlzaWJsZSA9ICFwYW5lbDIudmlzaWJsZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IEhhbmRsZSB1cGRhdGUgdG8gSFAgPSBmdWxsIGFzIGRpZmZlcmVudCBmcm9tIEhQIDwgZnVsbC5cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuZGVjbGFyZSBjb25zdCBUV0VFTjogYW55O1xyXG5cclxuaW1wb3J0IHtCdWlsZGluZ30gZnJvbSAnLi9idWlsZGluZyc7XHJcbmltcG9ydCB7Q3VydGFpbn0gZnJvbSAnLi9jdXJ0YWluJztcclxuaW1wb3J0IHtIcFBhbmVsc30gZnJvbSAnLi9ocC1wYW5lbHMnO1xyXG5pbXBvcnQge0hwT3JpZW50YXRpb259IGZyb20gJy4uLy4uL2RvbWFpbi9ocC1vcmllbnRhdGlvbic7XHJcbmltcG9ydCB7Um93Q2xlYXJEaXJlY3Rpb259IGZyb20gJy4uLy4uL2RvbWFpbi9yb3ctY2xlYXItZGlyZWN0aW9uJztcclxuaW1wb3J0IHtDdXJ0YWluRGlyZWN0aW9ufSBmcm9tICcuL2N1cnRhaW4nO1xyXG5pbXBvcnQge1BBTkVMX0NPVU5UX1BFUl9GTE9PUn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbnN0YW50cyc7XHJcblxyXG4vLyBUT0RPOiBPbmx5IHRoZSAzcmQgZmxvb3IgZnJvbSB0aGUgdG9wIGFuZCBiZWxvdyBhcmUgdmlzaWJsZS4gQWxzbywgc2VlIGJvYXJkLnRzLlxyXG5leHBvcnQgY29uc3QgRkxPT1JfQ09VTlQgPSAxNztcclxuXHJcbmNvbnN0IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVCA9IDQ7XHJcbmNvbnN0IFBBTkVMX1NJWkUgPSAwLjc7XHJcblxyXG5jbGFzcyBFbWlzc2l2ZUludGVuc2l0eSB7XHJcbiAgICB2YWx1ZTogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGlnaHRpbmdHcmlkIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsR3JvdXA6IGFueTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmc6IEJ1aWxkaW5nO1xyXG5cclxuICAgIHByaXZhdGUgcm93Q2xlYXJEaXJlY3Rpb246IFJvd0NsZWFyRGlyZWN0aW9uXHJcbiAgICBwcml2YXRlIHJvd0NsZWFyQ3VydGFpbjogQ3VydGFpbjtcclxuICAgIHByaXZhdGUganVua1Jvd0N1cnRhaW46IEN1cnRhaW47XHJcbiAgICBcclxuICAgIHByaXZhdGUgaHBQYW5lbHM6IEhwUGFuZWxzO1xyXG5cclxuICAgIHByaXZhdGUgcGFuZWxzOiBhbnlbXVtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIHNoYXBlTGlnaHRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFNoYXBlTGlnaHRJZHg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaGlnaGxpZ2h0ZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHB1bHNlVHdlZW46IGFueTtcclxuICAgIHByaXZhdGUgcHVsc2VUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZW1pc3NpdmVJbnRlbnNpdHk6IEVtaXNzaXZlSW50ZW5zaXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhwT3JpZW50YXRpb246IEhwT3JpZW50YXRpb24sIHJvd0NsZWFyRGlyZWN0aW9uOiBSb3dDbGVhckRpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5lbEdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgICAgICAgdGhpcy5idWlsZGluZyA9IG5ldyBCdWlsZGluZygpO1xyXG5cclxuICAgICAgICB0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID0gcm93Q2xlYXJEaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4gPSBuZXcgQ3VydGFpbigpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4gPSBuZXcgQ3VydGFpbigpO1xyXG5cclxuICAgICAgICB0aGlzLmhwUGFuZWxzID0gbmV3IEhwUGFuZWxzKGhwT3JpZW50YXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLnBhbmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZsb29ySWR4ID0gMDsgZmxvb3JJZHggPCBGTE9PUl9DT1VOVDsgZmxvb3JJZHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsc1tmbG9vcklkeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWxJZHggPSAwOyBwYW5lbElkeCA8IFBBTkVMX0NPVU5UX1BFUl9GTE9PUjsgcGFuZWxJZHgrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoUEFORUxfU0laRSwgUEFORUxfU0laRSk7IC8vIFRPRE86IGNsb25lKCkgP1xyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFuZWwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICAgICAgcGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4ID0gcGFuZWxJZHg7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgICAgICAgICBsZXQgeiA9IDA7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XSA9IHBhbmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNoYXBlTGlnaHRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgY291bnQgPSAwOyBjb3VudCA8IEFDVElWRV9TSEFQRV9MSUdIVF9DT1VOVDsgY291bnQrKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShQQU5FTF9TSVpFLCBQQU5FTF9TSVpFKTtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtlbWlzc2l2ZUludGVuc2l0eTogMS4wfSk7XHJcbiAgICAgICAgICAgIGxldCBzaGFwZUxpZ2h0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5zaGFwZUxpZ2h0cy5wdXNoKHNoYXBlTGlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZUxpZ2h0SWR4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRlciA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmYwMGZmLCAzLjUsIDMpO1xyXG5cclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucHVsc2VUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkgPSBuZXcgRW1pc3NpdmVJbnRlbnNpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmJ1aWxkaW5nLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLnJvd0NsZWFyQ3VydGFpbi5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5qdW5rUm93Q3VydGFpbi5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5ocFBhbmVscy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hZGQodGhpcy5wYW5lbEdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZy5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMucm93Q2xlYXJDdXJ0YWluLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5qdW5rUm93Q3VydGFpbi5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZmxvb3Igb2YgdGhpcy5wYW5lbHMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFuZWwgb2YgZmxvb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQocGFuZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBzaGFwZUxpZ2h0IG9mIHRoaXMuc2hhcGVMaWdodHMpIHtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbEdyb3VwLmFkZChzaGFwZUxpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5hZGQodGhpcy5oaWdobGlnaHRlcik7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0byBmaXQgYWdhaW5zdCBidWlsZGluZy5cclxuICAgICAgICB0aGlzLnBhbmVsR3JvdXAucG9zaXRpb24uc2V0KDEuODUsIDMuOCwgLTEuNTUpO1xyXG4gICAgICAgIHRoaXMucGFuZWxHcm91cC5zY2FsZS5zZXQoMC43LCAxLjAsIDEpO1xyXG5cclxuICAgICAgICAvLyBNYWtlIGNlbGxzIGFwcGVhciB0byBwdWxzZS5cclxuICAgICAgICB0aGlzLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlID0gMC4zMztcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkID0gMDtcclxuICAgICAgICB0aGlzLnB1bHNlVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5lbWlzc2l2ZUludGVuc2l0eSlcclxuICAgICAgICAgICAgLnRvKHt2YWx1ZTogMS4wfSwgNzUwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5TaW51c29pZGFsLkluT3V0KVxyXG4gICAgICAgICAgICAueW95byh0cnVlKVxyXG4gICAgICAgICAgICAucmVwZWF0KEluZmluaXR5KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBQdWxzZShlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLnJvd0NsZWFyQ3VydGFpbi5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB0aGlzLmhwUGFuZWxzLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9mZihmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHBhbmVsID0gdGhpcy5wYW5lbHNbZmxvb3JJZHhdW3BhbmVsSWR4XTtcclxuICAgICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoUm9vbU9uKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSB0aGlzLnBhbmVsc1tmbG9vcklkeF1bcGFuZWxJZHhdO1xyXG4gICAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHBhbmVsLm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgcGFuZWwubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kQWN0aXZlU2hhcGVMaWdodFRvKGZsb29ySWR4OiBudW1iZXIsIHBhbmVsSWR4OiBudW1iZXIsIGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2hhcGVMaWdodCA9IHRoaXMuZ2V0TmV4dFNoYXBlTGlnaHQoKTtcclxuICAgICAgICBzaGFwZUxpZ2h0Lm1hdGVyaWFsLmNvbG9yLnNldEhleChjb2xvcik7XHJcbiAgICAgICAgc2hhcGVMaWdodC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoY29sb3IpO1xyXG5cclxuICAgICAgICAvLyBEbyBub3QgbGlnaHQgaWYgaGlnaGVyIHRoYW4gdGhlIGhpZ2hlc3QgKnZpc2libGUqIGZsb29yLlxyXG4gICAgICAgIGlmIChmbG9vcklkeCA+PSBGTE9PUl9DT1VOVCkge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaGFwZUxpZ2h0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHNoYXBlTGlnaHQucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGl2ZVNoYXBlTGlnaHRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5wb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kSGlnaGxpZ2h0ZXJUbyhmbG9vcklkeDogbnVtYmVyLCBwYW5lbElkeDogbnVtYmVyLCBjb2xvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gRG8gbm90IGxpZ2h0IGlmIGhpZ2hlciB0aGFuIHRoZSBoaWdoZXN0ICp2aXNpYmxlKiBmbG9vci5cclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlci5jb2xvci5zZXRIZXgoY29sb3IpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSBwYW5lbElkeDtcclxuICAgICAgICBsZXQgeSA9IGZsb29ySWR4ICsgMTsgLy8gT2Zmc2V0IHVwIDEgYmVjYXVzZSBncm91bmQgaXMgeSA9IDAuXHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIucG9zaXRpb24uc2V0KHgsIHksIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUhwKGhwOiBudW1iZXIsIGJsaW5rTG9zdDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuaHBQYW5lbHMudXBkYXRlSHAoaHAsIGJsaW5rTG9zdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRSb3dDbGVhcmluZ0FuaW1hdGlvbihmbG9vcklkeHM6IG51bWJlcltdLCBjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBjdXJ0YWluRGlyZWN0aW9uOiBDdXJ0YWluRGlyZWN0aW9uO1xyXG4gICAgICAgIGlmICh0aGlzLnJvd0NsZWFyRGlyZWN0aW9uID09PSBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCkge1xyXG4gICAgICAgICAgICBjdXJ0YWluRGlyZWN0aW9uID0gQ3VydGFpbkRpcmVjdGlvbi5PcGVuTGVmdFRvUmlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uT3BlblJpZ2h0VG9MZWZ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yb3dDbGVhckN1cnRhaW4uc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzLCBjdXJ0YWluRGlyZWN0aW9uLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRKdW5rUm93Q3VydGFpbkFuaW1hdGlvbihmbG9vckNvdW50OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZmxvb3JDb3VudCA+IDQpIHtcclxuICAgICAgICAgICAgZmxvb3JDb3VudCA9IDQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmbG9vckNvdW50IDwgMCkge1xyXG4gICAgICAgICAgICBmbG9vckNvdW50ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZsb29ySWR4cyA9IFswLCAxLCAyLCAzXS5zbGljZSgwLCBmbG9vckNvdW50KTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnRhaW5EaXJlY3Rpb246IEN1cnRhaW5EaXJlY3Rpb247XHJcbiAgICAgICAgaWYgKHRoaXMucm93Q2xlYXJEaXJlY3Rpb24gPT09IFJvd0NsZWFyRGlyZWN0aW9uLkxlZnRUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIGN1cnRhaW5EaXJlY3Rpb24gPSBDdXJ0YWluRGlyZWN0aW9uLkNsb3NlUmlnaHRUb0xlZnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VydGFpbkRpcmVjdGlvbiA9IEN1cnRhaW5EaXJlY3Rpb24uQ2xvc2VMZWZ0VG9SaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuanVua1Jvd0N1cnRhaW4uc3RhcnRBbmltYXRpb24oZmxvb3JJZHhzLCBjdXJ0YWluRGlyZWN0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hhcGVMaWdodHNBbmRIaWdobGlnaHRlcigpIHtcclxuICAgICAgICBmb3IgKGxldCBzaGFwZUxpZ2h0IG9mIHRoaXMuc2hhcGVMaWdodHMpIHtcclxuICAgICAgICAgICAgc2hhcGVMaWdodC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV4dFNoYXBlTGlnaHQoKSB7XHJcbiAgICAgICAgbGV0IHNoYXBlTGlnaHQgPSB0aGlzLnNoYXBlTGlnaHRzW3RoaXMuY3VycmVudFNoYXBlTGlnaHRJZHhdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNoYXBlTGlnaHRJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA+PSBBQ1RJVkVfU0hBUEVfTElHSFRfQ09VTlQpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2hhcGVMaWdodElkeCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzaGFwZUxpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcFB1bHNlKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnB1bHNlVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnB1bHNlVHdlZW5FbGFwc2VkICs9IGVsYXBzZWQ7XHJcbiAgICAgICAgICAgIHRoaXMucHVsc2VUd2Vlbi51cGRhdGUodGhpcy5wdWxzZVR3ZWVuRWxhcHNlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGZsb29yIG9mIHRoaXMucGFuZWxzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhbmVsIG9mIGZsb29yKSB7XHJcbiAgICAgICAgICAgICAgICBwYW5lbC5tYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IHRoaXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7Q2VsbENoYW5nZUV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9jZWxsLWNoYW5nZS1ldmVudCc7XHJcbmltcG9ydCB7QWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L2FjdGl2ZS1zaGFwZS1jaGFuZ2VkLWV2ZW50JztcclxuaW1wb3J0IHtIcENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvaHAtY2hhbmdlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0ZpbGxlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9yb3dzLWZpbGxlZC1ldmVudCc7XHJcbmltcG9ydCB7Um93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L3Jvd3MtY2xlYXItYW5pbWF0aW9uLWNvbXBsZXRlZC1ldmVudCc7XHJcbmltcG9ydCB7RmFsbGluZ1NlcXVlbmNlckV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9mYWxsaW5nLXNlcXVlbmNlci1ldmVudCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkLCBGTE9PUl9DT1VOVH0gZnJvbSAnLi9saWdodGluZy1ncmlkJztcclxuaW1wb3J0IHtDb2xvcn0gZnJvbSAnLi4vLi4vZG9tYWluL2NvbG9yJztcclxuaW1wb3J0IHtDZWxsT2Zmc2V0fSBmcm9tICcuLi8uLi9kb21haW4vY2VsbCc7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTd2l0Y2hib2FyZCB7XHJcblxyXG4gICAgcHJpdmF0ZSBsaWdodGluZ0dyaWQ6IExpZ2h0aW5nR3JpZDtcclxuICAgIHByaXZhdGUgcGxheWVyVHlwZTogUGxheWVyVHlwZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaWdodGluZ0dyaWQ6IExpZ2h0aW5nR3JpZCwgcGxheWVyVHlwZTogUGxheWVyVHlwZSkge1xyXG4gICAgICAgIHRoaXMubGlnaHRpbmdHcmlkID0gbGlnaHRpbmdHcmlkO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5BY3RpdmVTaGFwZUNoYW5nZWRFdmVudFR5cGUsIChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZXZlbnRCdXMucmVnaXN0ZXIoRXZlbnRUeXBlLkNlbGxDaGFuZ2VFdmVudFR5cGUsIChldmVudDogQ2VsbENoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2VsbENoYW5nZUV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuUm93c0ZpbGxlZEV2ZW50VHlwZSwgKGV2ZW50OiBSb3dzRmlsbGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PT0gZXZlbnQucGxheWVyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlUm93Q2xlYXJpbmcoZXZlbnQuZmlsbGVkUm93SWR4cyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVKdW5rUm93QWRkaW5nKGV2ZW50LmZpbGxlZFJvd0lkeHMubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuSHBDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IEhwQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllclR5cGUgPT09IGV2ZW50LnBsYXllclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlSHBDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50QnVzLnJlZ2lzdGVyKEV2ZW50VHlwZS5GYWxsaW5nU2VxdWVuY2VyRXZlbnRUeXBlLCAoZXZlbnQ6IEZhbGxpbmdTZXF1ZW5jZXJFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBldmVudC5wbGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUZhbGxpbmdTZXF1ZW5jZXJFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVBY3RpdmVTaGFwZUNoYW5nZWRFdmVudChldmVudDogQWN0aXZlU2hhcGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHggPSB0aGlzLmNvbnZlcnRSb3dUb0Zsb29yKGV2ZW50LnNoYXBlLmdldFJvdygpKTtcclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5zaGFwZS5nZXRDb2woKTtcclxuICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmNvbnZlcnRDb2xvcihldmVudC5zaGFwZS5jb2xvcik7XHJcblxyXG4gICAgICAgIGxldCB5VG90YWxPZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCB4VG90YWxPZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCBvZmZzZXRzID0gZXZlbnQuc2hhcGUuZ2V0T2Zmc2V0cygpO1xyXG4gICAgICAgIGZvciAobGV0IG9mZnNldCBvZiBvZmZzZXRzKSB7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRGbG9vcklkeCA9IGZsb29ySWR4IC0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRQYW5lbElkeCA9IHBhbmVsSWR4ICsgb2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnNlbmRBY3RpdmVTaGFwZUxpZ2h0VG8ob2Zmc2V0Rmxvb3JJZHgsIG9mZnNldFBhbmVsSWR4LCBjb2xvcik7XHJcblxyXG4gICAgICAgICAgICB5VG90YWxPZmZzZXQgKz0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHhUb3RhbE9mZnNldCArPSBvZmZzZXQueDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB5b2ZmID0gKHlUb3RhbE9mZnNldCAvIG9mZnNldHMubGVuZ3RoKSAtIDI7XHJcbiAgICAgICAgbGV0IHhvZmYgPSB4VG90YWxPZmZzZXQgLyBvZmZzZXRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmxpZ2h0aW5nR3JpZC5zZW5kSGlnaGxpZ2h0ZXJUbyhmbG9vcklkeCArIHlvZmYsIHBhbmVsSWR4ICsgeG9mZiwgY29sb3IpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09PSBQbGF5ZXJUeXBlLkh1bWFuKSB7XHJcbiAgICAgICAgICAgIGxldCBhY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24gPSB0aGlzLmxpZ2h0aW5nR3JpZC5nZXRBY3RpdmVTaGFwZUxpZ2h0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgLy8gVE9ETzogSGF2ZSB0aGUgY2FtZXJhIGxvb2sgYXQgdGhpcz9cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDZWxsQ2hhbmdlRXZlbnQoZXZlbnQ6IENlbGxDaGFuZ2VFdmVudCkge1xyXG4gICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZXZlbnQucm93KTtcclxuICAgICAgICBpZiAoZmxvb3JJZHggPj0gRkxPT1JfQ09VTlQpIHtcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBTa2lwIG9ic3RydWN0ZWQgZmxvb3JzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFuZWxJZHggPSBldmVudC5jb2w7XHJcbiAgICAgICAgaWYgKGV2ZW50LmNlbGwuZ2V0Q29sb3IoKSA9PT0gQ29sb3IuRW1wdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3dpdGNoUm9vbU9mZihmbG9vcklkeCwgcGFuZWxJZHgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHRoaXMuY29udmVydENvbG9yKGV2ZW50LmNlbGwuZ2V0Q29sb3IoKSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHRpbmdHcmlkLnN3aXRjaFJvb21PbihmbG9vcklkeCwgcGFuZWxJZHgsIGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRlUm93Q2xlYXJpbmcoZmlsbGVkUm93SWR4czogbnVtYmVyW10pIHtcclxuICAgICAgICBsZXQgZmxvb3JJZHhzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGZpbGxlZFJvd0lkeCBvZiBmaWxsZWRSb3dJZHhzKSB7XHJcbiAgICAgICAgICAgIGxldCBmbG9vcklkeCA9IHRoaXMuY29udmVydFJvd1RvRmxvb3IoZmlsbGVkUm93SWR4KTtcclxuICAgICAgICAgICAgZmxvb3JJZHhzLnB1c2goZmxvb3JJZHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3RhcnRSb3dDbGVhcmluZ0FuaW1hdGlvbihmbG9vcklkeHMsICgpID0+IHtcclxuICAgICAgICAgICAgZXZlbnRCdXMuZmlyZShuZXcgUm93c0NsZWFyQW5pbWF0aW9uQ29tcGxldGVkRXZlbnQodGhpcy5wbGF5ZXJUeXBlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1lbWJlciB0aGF0IHRoZSBqdW5rIHJvd3MgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgb24gdGhlIGJvYXJkLlxyXG4gICAgICogXHJcbiAgICAgKiBEbyBub3QgbmVlZCB0byBmaXJlIGFuIGV2ZW50IGF0IHRoZSBlbmQgb2YgdGhpcyBhbmltYXRpb24gYmVjYXVzZSB0aGUgYm9hcmRcclxuICAgICAqIGRvZXMgbm90IG5lZWQgdG8gbGlzdGVuIGZvciBpdCAoaXQgbGlzdGVucyBmb3IgdGhlIGNsZWFyaW5nIGFuaW1hdGlvbiBpbnN0ZWFkKS5cclxuICAgICovXHJcbiAgICBwcml2YXRlIGFuaW1hdGVKdW5rUm93QWRkaW5nKGp1bmtSb3dDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuc3RhcnRKdW5rUm93Q3VydGFpbkFuaW1hdGlvbihqdW5rUm93Q291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlSHBDaGFuZ2VkRXZlbnQoZXZlbnQ6IEhwQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQudXBkYXRlSHAoZXZlbnQuaHAsIGV2ZW50LmJsaW5rTG9zdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVGYWxsaW5nU2VxdWVuY2VyRXZlbnQoZXZlbnQ6IEZhbGxpbmdTZXF1ZW5jZXJFdmVudCl7XHJcbiAgICAgICAgdGhpcy5saWdodGluZ0dyaWQuaGlkZVNoYXBlTGlnaHRzQW5kSGlnaGxpZ2h0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgY2VsbCByb3cvY29sIGNvb3JkaW5hdGVzIHRvIGZsb29yL3BhbmVsIGNvb3JkaW5hdGVzLlxyXG4gICAgICogQWNjb3VudCBmb3IgdGhlIHR3byBmbG9vcnMgdGhhdCBhcmUgb2JzdHJ1Y3RlZCBmcm9tIHZpZXcuICg/KVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRSb3dUb0Zsb29yKHJvdzogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRoaW5nID0gKEZMT09SX0NPVU5UIC0gcm93KSArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29udmVydENvbG9yKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkN5YW46XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4MzNjY2NjO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuWWVsbG93OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweGZmZmY1NTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENvbG9yLlB1cnBsZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHhhMDIwYTA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5HcmVlbjpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHgyMGEwMjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5SZWQ6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmYzMzMzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gMHg0NDQ0Y2M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDb2xvci5PcmFuZ2U6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZWVkNTMwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29sb3IuV2hpdGU6XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgb3IgbWlzc2luZyBjYXNlIGlzIGJsYWNrLlxyXG4gICAgICAgICAgICBjYXNlIENvbG9yLkVtcHR5OlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAweDAwMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0iLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG4vLyBEaW1lbnNpb25zIG9mIHRoZSBlbnRpcmUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVTSEVFVF9XSURUSCAgID0gMjU2O1xyXG5leHBvcnQgY29uc3QgU1BSSVRFU0hFRVRfSEVJR0hUICA9IDUxMjtcclxuXHJcbi8vIERpbWVuc2lvbnMgb2Ygb25lIGZyYW1lIHdpdGhpbiB0aGUgc3ByaXRlc2hlZXQ6XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9XSURUSCAgID0gNDg7XHJcbmV4cG9ydCBjb25zdCBGUkFNRV9IRUlHSFQgID0gNzI7XHJcblxyXG5jb25zdCBGSUxFU19UT19QUkVMT0FEID0gMztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IHRleHR1cmU6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0dXJlOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2Uge1xyXG5cclxuICAgIHByaXZhdGUgdGV4dHVyZXM6IGFueVtdO1xyXG4gICAgcHJpdmF0ZSBsb2FkZWRDb3VudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50VGV4dHVyZUlkeDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmxvYWRlZENvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRUZXh0dXJlSWR4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKHNpZ25hbFRoYXRPbmVUZXh0dXJlV2FzTG9hZGVkOiAocmVzdWx0OiBib29sZWFuKSA9PiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVkSGFuZGxlciA9ICh0ZXh0dXJlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSBpdCBzaG93IG9ubHkgb25lIGZyYW1lIGF0IGEgdGltZTpcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KFxyXG4gICAgICAgICAgICAgICAgRlJBTUVfV0lEVEggIC8gU1BSSVRFU0hFRVRfV0lEVEgsXHJcbiAgICAgICAgICAgICAgICBGUkFNRV9IRUlHSFQgLyBTUFJJVEVTSEVFVF9IRUlHSFRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIHNpZ25hbFRoYXRPbmVUZXh0dXJlV2FzTG9hZGVkKHRydWUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBlcnJvckhhbmRsZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHNpZ25hbFRoYXRPbmVUZXh0dXJlV2FzTG9hZGVkKGZhbHNlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKCdmYWxsLXN0dWRlbnQucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIsIHVuZGVmaW5lZCwgZXJyb3JIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDIucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIsIHVuZGVmaW5lZCwgZXJyb3JIYW5kbGVyKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ2ZhbGwtc3R1ZGVudDMucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIsIHVuZGVmaW5lZCwgZXJyb3JIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEZJTEVTX1RPX1BSRUxPQUQ7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3SW5zdGFuY2UoKTogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyIHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5nZXROZXh0VGV4dHVyZUlkeCgpO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tpZHhdLmNsb25lKCk7IC8vIENsb25pbmcgdGV4dHVyZXMgaW4gdGhlIHZlcnNpb24gb2YgVGhyZWVKUyB0aGF0IEkgYW0gY3VycmVudGx5IHVzaW5nIHdpbGwgZHVwbGljYXRlIHRoZW0gOihcclxuICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlV3JhcHBlcih0ZXh0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5leHRUZXh0dXJlSWR4KCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VGV4dHVyZUlkeCA+PSBGSUxFU19UT19QUkVMT0FEKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRleHR1cmVJZHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGV4dHVyZUlkeDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlID0gbmV3IFN0YW5kZWVBbmltYXRpb25UZXh0dXJlQmFzZSgpOyIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7U3RhbmRlZX0gZnJvbSAnLi9zdGFuZGVlJztcclxuaW1wb3J0IHtFdmVudFR5cGUsIGV2ZW50QnVzfSBmcm9tICcuLi8uLi9ldmVudC9ldmVudC1idXMnO1xyXG5pbXBvcnQge05wY1BsYWNlZEV2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtcGxhY2VkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNUZWxlcG9ydGVkRXZlbnR9IGZyb20gJy4uLy4uL2V2ZW50L25wYy10ZWxlcG9ydGVkLWV2ZW50JztcclxuaW1wb3J0IHtOcGNNb3ZlbWVudENoYW5nZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvbnBjLW1vdmVtZW50LWNoYW5nZWQtZXZlbnQnO1xyXG5pbXBvcnQge05wY0ZhY2luZ0V2ZW50fSBmcm9tICcuLi8uLi9ldmVudC9ucGMtZmFjaW5nLWV2ZW50JztcclxuXHJcbmNvbnN0IFlfT0ZGU0VUID0gMC43NTsgLy8gU2V0cyB0aGVpciBmZWV0IG9uIHRoZSBncm91bmQgcGxhbmUuXHJcbmNvbnN0IFNUQU5ERUVfU1BFRUQgPSAwLjU7XHJcblxyXG5jbGFzcyBTdGFuZGVlTWFuYWdlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgZ3JvdXA6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHN0YW5kZWVzOiBNYXA8bnVtYmVyLCBTdGFuZGVlPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhbmRlZXMgPSBuZXcgTWFwPG51bWJlciwgU3RhbmRlZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldFkoWV9PRkZTRVQpO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjUGxhY2VkRXZlbnRUeXBlLCAoZXZlbnQ6IE5wY1BsYWNlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjUGxhY2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjVGVsZXBvcnRlZEV2ZW50VHlwZSwgKGV2ZW50OiBOcGNUZWxlcG9ydGVkRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVOcGNUZWxlcG9ydGVkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnRUeXBlLCAoZXZlbnQ6IE5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjTW92ZW1lbnRDaGFuZ2VkRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudEJ1cy5yZWdpc3RlcihFdmVudFR5cGUuTnBjRmFjaW5nRXZlbnRUeXBlLCAoZXZlbnQ6IE5wY0ZhY2luZ0V2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTnBjRmFjaW5nRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zdGFuZGVlcy5mb3JFYWNoKChzdGFuZGVlOiBTdGFuZGVlKSA9PiB7XHJcbiAgICAgICAgICAgIHN0YW5kZWUuc3RlcChlbGFwc2VkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY1BsYWNlZEV2ZW50KGV2ZW50OiBOcGNQbGFjZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gbmV3IFN0YW5kZWUoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIHN0YW5kZWUuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZChzdGFuZGVlLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnN0YW5kZWVzLnNldChzdGFuZGVlLm5wY0lkLCBzdGFuZGVlKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgIGxldCB6ID0gZXZlbnQueTtcclxuICAgICAgICB0aGlzLm1vdmVUb1Bvc2l0aW9uKHN0YW5kZWUsIHgsIHopO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlTnBjVGVsZXBvcnRlZEV2ZW50KGV2ZW50OiBOcGNUZWxlcG9ydGVkRXZlbnQpIHtcclxuICAgICAgICBsZXQgc3RhbmRlZSA9IHRoaXMuc3RhbmRlZXMuZ2V0KGV2ZW50Lm5wY0lkKTtcclxuICAgICAgICBpZiAoc3RhbmRlZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gZXZlbnQueDtcclxuICAgICAgICAgICAgbGV0IHogPSBldmVudC55O1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1Bvc2l0aW9uKHN0YW5kZWUsIHgsIHopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdmVUb1Bvc2l0aW9uKHN0YW5kZWU6IFN0YW5kZWUsIHg6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICAgICAgc3RhbmRlZS5tb3ZlVG8oeCx6KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY01vdmVtZW50Q2hhbmdlZEV2ZW50KGV2ZW50OiBOcGNNb3ZlbWVudENoYW5nZWRFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUud2Fsa1RvKHgsIHosIFNUQU5ERUVfU1BFRUQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5wY0ZhY2luZ0V2ZW50KGV2ZW50OiBOcGNGYWNpbmdFdmVudCkge1xyXG4gICAgICAgIGxldCBzdGFuZGVlID0gdGhpcy5zdGFuZGVlcy5nZXQoZXZlbnQubnBjSWQpO1xyXG4gICAgICAgIGlmIChzdGFuZGVlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBldmVudC54O1xyXG4gICAgICAgICAgICBsZXQgeiA9IGV2ZW50Lnk7XHJcbiAgICAgICAgICAgIHN0YW5kZWUubG9va0F0KHgsIHopO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3Qgc3RhbmRlZU1hbmFnZXIgPSBuZXcgU3RhbmRlZU1hbmFnZXIoKTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWIvbGliLmVzNi5kLnRzJy8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuaW1wb3J0IHtcclxuICAgIFNQUklURVNIRUVUX1dJRFRILFxyXG4gICAgU1BSSVRFU0hFRVRfSEVJR0hULFxyXG4gICAgRlJBTUVfV0lEVEgsXHJcbiAgICBGUkFNRV9IRUlHSFQsXHJcbiAgICBTdGFuZGVlQW5pbWF0aW9uVGV4dHVyZVdyYXBwZXIsXHJcbiAgICBzdGFuZGVlQW5pbWF0aW9uVGV4dHVyZUJhc2V9XHJcbmZyb20gJy4vc3RhbmRlZS1hbmltYXRpb24tdGV4dHVyZS1iYXNlJztcclxuXHJcbmNvbnN0IFNUQU5EQVJEX0RFTEFZID0gMjI1O1xyXG5jb25zdCBXQUxLX1VQX09SX0RPV05fREVMQVkgPSBNYXRoLmZsb29yKFNUQU5EQVJEX0RFTEFZICogKDIvMykpOyAvLyBCZWNhdXNlIHVwL2Rvd24gd2FsayBjeWNsZXMgaGF2ZSBtb3JlIGZyYW1lcy4gXHJcblxyXG5jb25zdCBzY3JhdGNoVmVjdG9yMTogYW55ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuY29uc3Qgc2NyYXRjaFZlY3RvcjI6IGFueSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblxyXG5jbGFzcyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUge1xyXG5cclxuICAgIHJlYWRvbmx5IHJvdzogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY29sOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7IFxyXG4gICAgICAgIHRoaXMuY29sID0gY29sO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBTdGFuZGVlQW5pbWF0aW9uVHlwZSB7XHJcbiAgICBTdGFuZFVwLFxyXG4gICAgU3RhbmREb3duLFxyXG4gICAgU3RhbmRMZWZ0LFxyXG4gICAgU3RhbmRSaWdodCxcclxuICAgIFdhbGtVcCxcclxuICAgIFdhbGtEb3duLFxyXG4gICAgV2Fsa0xlZnQsXHJcbiAgICBXYWxrUmlnaHQsXHJcbiAgICBDaGVlclVwLFxyXG4gICAgUGFuaWNVcCxcclxuICAgIFBhbmljRG93blxyXG59XHJcblxyXG5jbGFzcyBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIFxyXG4gICAgcmVhZG9ubHkgdHlwZTogU3RhbmRlZUFuaW1hdGlvblR5cGU7XHJcbiAgICByZWFkb25seSBuZXh0OiBTdGFuZGVlQW5pbWF0aW9uVHlwZTsgLy8gUHJvYmFibHkgbm90IGdvaW5nIHRvIGJlIHVzZWQgZm9yIHRoaXMgZ2FtZVxyXG5cclxuICAgIHJlYWRvbmx5IGZyYW1lczogU3RhbmRlZUFuaW1hdGlvbkZyYW1lW107XHJcbiAgICByZWFkb25seSBkZWxheXM6IG51bWJlcltdO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RnJhbWVJZHg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudEZyYW1lVGltZUVsYXBzZWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGZpbmlzaGVkOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IFN0YW5kZWVBbmltYXRpb25UeXBlLCBuZXh0PzogU3RhbmRlZUFuaW1hdGlvblR5cGUpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIGlmIChuZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCA9IG5leHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0ID0gdHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XHJcbiAgICAgICAgdGhpcy5kZWxheXMgPSBbXTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZUlkeCA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdXNoKGZyYW1lOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWUsIGRlbGF5ID0gU1RBTkRBUkRfREVMQVkpIHtcclxuICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgICAgICB0aGlzLmRlbGF5cy5wdXNoKGRlbGF5KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZyYW1lVGltZUVsYXBzZWQgKz0gZWxhcHNlZDtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA+PSB0aGlzLmRlbGF5c1t0aGlzLmN1cnJlbnRGcmFtZUlkeF0pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWVUaW1lRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4Kys7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZUlkeCA+PSB0aGlzLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lSWR4ID0gMDsgLy8gU2hvdWxkbid0IGJlIHVzZWQgYW55bW9yZSwgYnV0IHByZXZlbnQgb3V0LW9mLWJvdW5kcyBhbnl3YXkuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0ZpbmlzaGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRGcmFtZSgpOiBTdGFuZGVlQW5pbWF0aW9uRnJhbWUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZUlkeF07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlU3ByaXRlV3JhcHBlciB7XHJcbiAgICBcclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwcml0ZTogYW55O1xyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlV3JhcHBlcjogU3RhbmRlZUFuaW1hdGlvblRleHR1cmVXcmFwcGVyO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudEFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVGhyZWVKUyBvYmplY3RzOiBcclxuICAgICAgICB0aGlzLnRleHR1cmVXcmFwcGVyID0gc3RhbmRlZUFuaW1hdGlvblRleHR1cmVCYXNlLm5ld0luc3RhbmNlKCk7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlNwcml0ZU1hdGVyaWFsKHttYXA6IHRoaXMudGV4dHVyZVdyYXBwZXIudGV4dHVyZX0pO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFRIUkVFLlNwcml0ZShtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuc2NhbGUuc2V0KDEsIDEuNSk7IC8vIEFkanVzdCBhc3BlY3QgcmF0aW8gZm9yIDQ4IHggNzIgc2l6ZSBmcmFtZXMuIFxyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICAgICAgLy8gSGFsZiBzaXplIHRoZW0gYW5kIHBvc2l0aW9uIHRoZWlyIGZlZXQgb24gdGhlIGdyb3VuZC5cclxuICAgICAgICB0aGlzLmdyb3VwLnNjYWxlLnNldCgwLjUsIDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCgwLCAtMC40LCAwKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBkZWZhdWx0IGFuaW1hdGlvbiB0byBzdGFuZGluZyBmYWNpbmcgZG93bjpcclxuICAgICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICAvLyBUT0RPOiBTZXQgdGhpcyBlbHNld2hlcmVcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuYWRqdXN0TGlnaHRpbmcoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5zdGVwQW5pbWF0aW9uKGVsYXBzZWQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIE9ubHkgc3dpdGNoZXMgaWYgdGhlIGdpdmVuIGFuaW1hdGlvbiBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvbmUuXHJcbiAgICAgKi9cclxuICAgIHN3aXRjaEFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgIGxldCBhbmltYXRpb24gPSBkZXRlcm1pbmVBbmltYXRpb24odHlwZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi50eXBlICE9PSBhbmltYXRpb24udHlwZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSBhbmltYXRpb247XHJcbiAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkanVzdExpZ2h0aW5nKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIFRPRE86IE5vdCB5ZXQgc3VyZSBpZiBJJ2xsIG5lZWQgdG8gdXNlIHRoZSBlbGFwc2VkIHZhcmlhYmxlIGhlcmUuXHJcbiAgICAgICAgLy8gVE9ETzogTW92ZSBtYWdpYyBudW1iZXJzIGludG8gc2FtZSBlcXVhdGlvbnMgYXMgdGhlIE5QQ1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFdvcmxkUG9zaXRpb24oc2NyYXRjaFZlY3RvcjEpO1xyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIuY2FtZXJhLmdldFdvcmxkUG9zaXRpb24oc2NyYXRjaFZlY3RvcjIpO1xyXG4gICAgICAgIGxldCBkaXN0YW5jZVNxdWFyZWQ6IG51bWJlciA9IHNjcmF0Y2hWZWN0b3IxLmRpc3RhbmNlVG9TcXVhcmVkKHNjcmF0Y2hWZWN0b3IyKTtcclxuICAgICAgICBsZXQgdmFsdWUgPSBNYXRoLm1heCgwLjIwLCAxLjAgLSAoTWF0aC5taW4oMS4wLCBkaXN0YW5jZVNxdWFyZWQgLyAyMjUpKSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUubWF0ZXJpYWwuY29sb3Iuc2V0UkdCKHZhbHVlLCB2YWx1ZSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RlcEFuaW1hdGlvbihlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QW5pbWF0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuaW1hdGlvbi5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gZGV0ZXJtaW5lQW5pbWF0aW9uKHRoaXMuY3VycmVudEFuaW1hdGlvbi5uZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5jdXJyZW50QW5pbWF0aW9uLmdldEN1cnJlbnRGcmFtZSgpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGZyYW1lIGNvb3JkaW5hdGVzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXMgYW5kIHNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICBsZXQgeHBjdCA9IChmcmFtZS5jb2wgKiBGUkFNRV9XSURUSCkgLyBTUFJJVEVTSEVFVF9XSURUSDtcclxuICAgICAgICBsZXQgeXBjdCA9ICgoKFNQUklURVNIRUVUX0hFSUdIVCAvIEZSQU1FX0hFSUdIVCkgLSAxIC0gZnJhbWUucm93KSAqIEZSQU1FX0hFSUdIVCkgLyBTUFJJVEVTSEVFVF9IRUlHSFQ7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlV3JhcHBlci50ZXh0dXJlLm9mZnNldC5zZXQoeHBjdCwgeXBjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRldGVybWluZUFuaW1hdGlvbih0eXBlOiBTdGFuZGVlQW5pbWF0aW9uVHlwZSk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbjogU3RhbmRlZUFuaW1hdGlvbjtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlU3RhbmRVcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtVcDpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVTdGFuZERvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bjpcclxuICAgICAgICAgICAgYW5pbWF0aW9uID0gY3JlYXRlV2Fsa0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZExlZnQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0OlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVXYWxrTGVmdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVN0YW5kUmlnaHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQ6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZVdhbGtSaWdodCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFN0YW5kZWVBbmltYXRpb25UeXBlLkNoZWVyVXA6XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGNyZWF0ZUNoZWVyVXAoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY1VwKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duOlxyXG4gICAgICAgICAgICBhbmltYXRpb24gPSBjcmVhdGVQYW5pY0Rvd24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Nob3VsZCBub3QgZ2V0IGhlcmUnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFVwXHJcbmxldCBzdGFuZFVwRnJhbWUxICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAwKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kVXAoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRVcCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFVwRnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgVXBcclxubGV0IHdhbGtVcEZyYW1lMSAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgd2Fsa1VwRnJhbWUyICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgMSk7XHJcbmxldCB3YWxrVXBGcmFtZTMgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAyKTtcclxubGV0IHdhbGtVcEZyYW1lNCAgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDMpO1xyXG5sZXQgd2Fsa1VwRnJhbWU1ICAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMyk7XHJcbmxldCB3YWxrVXBGcmFtZTYgICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg1LCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrVXApO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUyLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWUzLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU1LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1VwRnJhbWU2LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gU3RhbmRpbmcgRG93blxyXG5sZXQgc3RhbmREb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdGFuZERvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHN0YW5kRG93bkZyYW1lMSk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59XHJcblxyXG4vLyBXYWxraW5nIERvd25cclxubGV0IHdhbGtEb3duRnJhbWUxICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDApO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTIgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMSk7XHJcbmxldCB3YWxrRG93bkZyYW1lMyAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgwLCAyKTtcclxubGV0IHdhbGtEb3duRnJhbWU0ICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDMpO1xyXG5sZXQgd2Fsa0Rvd25GcmFtZTUgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMyk7XHJcbmxldCB3YWxrRG93bkZyYW1lNiAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgyLCAzKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtEb3duKCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWUxLCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTIsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lMywgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtEb3duRnJhbWU0LCBXQUxLX1VQX09SX0RPV05fREVMQVkpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa0Rvd25GcmFtZTUsIFdBTEtfVVBfT1JfRE9XTl9ERUxBWSk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrRG93bkZyYW1lNiwgV0FMS19VUF9PUl9ET1dOX0RFTEFZKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIExlZnRcclxubGV0IHN0YW5kTGVmdEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDEpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU3RhbmRMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLlN0YW5kTGVmdCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZExlZnRGcmFtZTEpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gV2Fsa2luZyBMZWZ0XHJcbmxldCB3YWxrTGVmdEZyYW1lMSAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAxKTtcclxubGV0IHdhbGtMZWZ0RnJhbWUyICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDApO1xyXG5sZXQgd2Fsa0xlZnRGcmFtZTMgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMSwgMSk7XHJcbmxldCB3YWxrTGVmdEZyYW1lNCAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCAyKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdhbGtMZWZ0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUxKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtMZWZ0RnJhbWU0KTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFN0YW5kaW5nIFJpZ2h0XHJcbmxldCBzdGFuZFJpZ2h0RnJhbWUxICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YW5kUmlnaHQoKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaChzdGFuZFJpZ2h0RnJhbWUxKTtcclxuICAgIHJldHVybiBhbmltYXRpb247XHJcbn1cclxuXHJcbi8vIFdhbGtpbmcgUmlnaHRcclxubGV0IHdhbGtSaWdodEZyYW1lMSAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDEsIDQpO1xyXG5sZXQgd2Fsa1JpZ2h0RnJhbWUyICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMiwgNCk7XHJcbmxldCB3YWxrUmlnaHRGcmFtZTMgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgxLCA0KTtcclxubGV0IHdhbGtSaWdodEZyYW1lNCAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDAsIDQpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlV2Fsa1JpZ2h0KCk6IFN0YW5kZWVBbmltYXRpb24ge1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtSaWdodCk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2god2Fsa1JpZ2h0RnJhbWUyKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHdhbGtSaWdodEZyYW1lMyk7XHJcbiAgICBhbmltYXRpb24ucHVzaCh3YWxrUmlnaHRGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gQ2hlZXIgVXBcclxubGV0IGNoZWVyVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgY2hlZXJVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMCk7XHJcbmxldCBjaGVlclVwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSgzLCAxKTtcclxubGV0IGNoZWVyVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDApO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlZXJVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5DaGVlclVwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2goY2hlZXJVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChjaGVlclVwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKGNoZWVyVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgVXBcclxubGV0IHBhbmljVXBGcmFtZTEgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDIsIDApO1xyXG5sZXQgcGFuaWNVcEZyYW1lMiAgICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMywgMik7XHJcbmxldCBwYW5pY1VwRnJhbWUzICAgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAwKTtcclxubGV0IHBhbmljVXBGcmFtZTQgICAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDMsIDIpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGFuaWNVcCgpOiBTdGFuZGVlQW5pbWF0aW9uIHtcclxuICAgIGxldCBhbmltYXRpb24gPSBuZXcgU3RhbmRlZUFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5QYW5pY1VwKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTEpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNVcEZyYW1lMik7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY1VwRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljVXBGcmFtZTQpO1xyXG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcclxufVxyXG5cclxuLy8gUGFuaWMgRG93blxyXG5sZXQgcGFuaWNEb3duRnJhbWUxICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoMCwgMCk7XHJcbmxldCBwYW5pY0Rvd25GcmFtZTIgICAgID0gbmV3IFN0YW5kZWVBbmltYXRpb25GcmFtZSg0LCAxKTtcclxubGV0IHBhbmljRG93bkZyYW1lMyAgICAgPSBuZXcgU3RhbmRlZUFuaW1hdGlvbkZyYW1lKDQsIDIpO1xyXG5sZXQgcGFuaWNEb3duRnJhbWU0ICAgICA9IG5ldyBTdGFuZGVlQW5pbWF0aW9uRnJhbWUoNCwgMSk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQYW5pY0Rvd24oKTogU3RhbmRlZUFuaW1hdGlvbiB7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gbmV3IFN0YW5kZWVBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuUGFuaWNEb3duKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lMSk7XHJcbiAgICBhbmltYXRpb24ucHVzaChwYW5pY0Rvd25GcmFtZTIpO1xyXG4gICAgYW5pbWF0aW9uLnB1c2gocGFuaWNEb3duRnJhbWUzKTtcclxuICAgIGFuaW1hdGlvbi5wdXNoKHBhbmljRG93bkZyYW1lNCk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG59IiwiZGVjbGFyZSBjb25zdCBUSFJFRTogYW55O1xyXG5kZWNsYXJlIGNvbnN0IFRXRUVOOiBhbnk7XHJcblxyXG5pbXBvcnQge0V2ZW50VHlwZSwgZXZlbnRCdXN9IGZyb20gJy4uLy4uL2V2ZW50L2V2ZW50LWJ1cyc7XHJcbmltcG9ydCB7U3RhbmRlZU1vdmVtZW50RW5kZWRFdmVudH0gZnJvbSAnLi4vLi4vZXZlbnQvc3RhbmRlZS1tb3ZlbWVudC1lbmRlZC1ldmVudCc7XHJcbmltcG9ydCB7U3RhbmRlZVNwcml0ZVdyYXBwZXIsIFN0YW5kZWVBbmltYXRpb25UeXBlfSBmcm9tICcuL3N0YW5kZWUtc3ByaXRlLXdyYXBwZXInO1xyXG5pbXBvcnQge2NhbWVyYVdyYXBwZXJ9IGZyb20gJy4uL2NhbWVyYS13cmFwcGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTdGFuZGVlIHtcclxuXHJcbiAgICByZWFkb25seSBucGNJZDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcbiAgICByZWFkb25seSBzcHJpdGVXcmFwcGVyOiBTdGFuZGVlU3ByaXRlV3JhcHBlcjtcclxuXHJcbiAgICBwcml2YXRlIHdhbGtUd2VlbkVsYXBzZWQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgd2Fsa1R3ZWVuOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBmYWNpbmc6IGFueTsgLy8gRmFjZXMgaW4gdGhlIHZlY3RvciBvZiB3aGljaCB3YXkgdGhlIE5QQyBpcyB3YWxraW5nLCB3YXMgd2Fsa2luZyBiZWZvcmUgc3RvcHBpbmcsIG9yIHdhcyBzZXQgdG8uXHJcblxyXG4gICAgY29uc3RydWN0b3IobnBjSWQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubnBjSWQgPSBucGNJZDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlciA9IG5ldyBTdGFuZGVlU3ByaXRlV3JhcHBlcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuc3ByaXRlV3JhcHBlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgdGhpcy53YWxrVHdlZW4gPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZhY2luZyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cC5wb3NpdGlvbi5zZXQoLTIwMCwgMCwgLTIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0ZXBXYWxrKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3RlcChlbGFwc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEltbWVkaWF0ZWx5IHNldCBzdGFuZGVlIG9uIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBtb3ZlVG8oeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLnNldCh4LCAwLCB6KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGFuZGVlIGluIG1vdGlvbiB0b3dhcmRzIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogU3BlZWQgZGltZW5zaW9uIGlzIDEgdW5pdC9zZWMuXHJcbiAgICAgKi9cclxuICAgIHdhbGtUbyh4OiBudW1iZXIsIHo6IG51bWJlciwgc3BlZWQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3cgbG9uZyBpdCB3b3VsZCB0YWtlLCBnaXZlbiB0aGUgc3BlZWQgcmVxdWVzdGVkLlxyXG4gICAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCAwLCB6KS5zdWIodGhpcy5ncm91cC5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gdmVjdG9yLmxlbmd0aCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gKGRpc3RhbmNlIC8gc3BlZWQpICogMTAwMDtcclxuXHJcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdHdlZW4uanMuIFBhc3MgaW4gY2xvc3VyZXMgYXMgY2FsbGJhY2tzIGJlY2F1c2Ugb3RoZXJ3aXNlICd0aGlzJyB3aWxsIHJlZmVyXHJcbiAgICAgICAgLy8gdG8gdGhlIHBvc2l0aW9uIG9iamVjdCwgd2hlbiBleGVjdXRpbmcgc3RvcFdhbGsoKS5cclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHRoaXMuZ3JvdXAucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7eDogeCwgejogen0sIHRpbWUpXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHsgdGhpcy5zdG9wV2FsaygpOyB9KVxyXG4gICAgICAgICAgICAuc3RhcnQodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGRhdGUgZGlyZWN0aW9uIHRoaXMgc3RhbmRlZSB3aWxsIGJlIGZhY2luZyB3aGVuIHdhbGtpbmcuXHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0WCh4IC0gdGhpcy5ncm91cC5wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmZhY2luZy5zZXRaKHogLSB0aGlzLmdyb3VwLnBvc2l0aW9uLnopO1xyXG4gICAgfVxyXG5cclxuICAgIGxvb2tBdCh4OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZmFjaW5nLnNldFgoeCAtIHRoaXMuZ3JvdXAucG9zaXRpb24ueCk7XHJcbiAgICAgICAgdGhpcy5mYWNpbmcuc2V0Wih6IC0gdGhpcy5ncm91cC5wb3NpdGlvbi56KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXBXYWxrKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLndhbGtUd2VlbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2Fsa1R3ZWVuRWxhcHNlZCArPSBlbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLndhbGtUd2Vlbi51cGRhdGUodGhpcy53YWxrVHdlZW5FbGFwc2VkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdG9wV2FsaygpIHtcclxuICAgICAgICB0aGlzLndhbGtUd2VlbkVsYXBzZWQgPSAwO1xyXG4gICAgICAgIHRoaXMud2Fsa1R3ZWVuID0gbnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBldmVudEJ1cy5maXJlKG5ldyBTdGFuZGVlTW92ZW1lbnRFbmRlZEV2ZW50KFxyXG4gICAgICAgICAgICB0aGlzLm5wY0lkLFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAucG9zaXRpb24ueilcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5zdXJlQ29ycmVjdEFuaW1hdGlvbigpIHtcclxuICAgICAgICAvLyBsZXQgdGFyZ2V0ID0gdGhpcy5ncm91cC5wb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgIC8vIHRhcmdldC5zZXRZKHRhcmdldC55ICsgMC41KTtcclxuICAgICAgICAvLyBjYW1lcmFXcmFwcGVyLmNhbWVyYS5sb29rQXQodGFyZ2V0KTtcclxuXHJcbiAgICAgICAgLy8gQW5nbGUgYmV0d2VlbiB0d28gdmVjdG9yczogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE0ODQyMjhcclxuICAgICAgICBsZXQgd29ybGREaXJlY3Rpb24gPSBjYW1lcmFXcmFwcGVyLmNhbWVyYS5nZXRXb3JsZERpcmVjdGlvbigpO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy5mYWNpbmcueiwgdGhpcy5mYWNpbmcueCkgLSBNYXRoLmF0YW4yKHdvcmxkRGlyZWN0aW9uLnosIHdvcmxkRGlyZWN0aW9uLngpO1xyXG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIGFuZ2xlICo9ICgxODAvTWF0aC5QSSk7IC8vIEl0J3MgbXkgcGFydHkgYW5kIEknbGwgdXNlIGRlZ3JlZXMgaWYgSSB3YW50IHRvLlxyXG5cclxuICAgICAgICBpZiAodGhpcy53YWxrVHdlZW4gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoYW5nbGUgPCA2MCB8fCBhbmdsZSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuV2Fsa1VwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSA2MCAmJiBhbmdsZSA8IDEyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrUmlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlID49IDEyMCAmJiBhbmdsZSA8IDI0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5XYWxrRG93bik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5nbGUgPj0gMjQwICYmIGFuZ2xlIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVdyYXBwZXIuc3dpdGNoQW5pbWF0aW9uKFN0YW5kZWVBbmltYXRpb25UeXBlLldhbGtMZWZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA8IDYwIHx8IGFuZ2xlID49IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFVwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSA2MCAmJiBhbmdsZSA8IDEyMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXcmFwcGVyLnN3aXRjaEFuaW1hdGlvbihTdGFuZGVlQW5pbWF0aW9uVHlwZS5TdGFuZFJpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAxMjAgJiYgYW5nbGUgPCAyNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmREb3duKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA+PSAyNDAgJiYgYW5nbGUgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV3JhcHBlci5zd2l0Y2hBbmltYXRpb24oU3RhbmRlZUFuaW1hdGlvblR5cGUuU3RhbmRMZWZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbmltcG9ydCB7Y2FtZXJhV3JhcHBlcn0gZnJvbSAnLi9jYW1lcmEtd3JhcHBlcic7XHJcbmltcG9ydCB7c2t5fSBmcm9tICcuL3dvcmxkL3NreSc7XHJcbmltcG9ydCB7Z3JvdW5kfSBmcm9tICcuL3dvcmxkL2dyb3VuZCc7XHJcbmltcG9ydCB7TGlnaHRpbmdHcmlkfSBmcm9tICcuL2xpZ2h0aW5nL2xpZ2h0aW5nLWdyaWQnO1xyXG5pbXBvcnQge1N3aXRjaGJvYXJkfSBmcm9tICcuL2xpZ2h0aW5nL3N3aXRjaGJvYXJkJztcclxuaW1wb3J0IHtzdGFuZGVlTWFuYWdlcn0gZnJvbSAnLi9zdGFuZGVlL3N0YW5kZWUtbWFuYWdlcic7XHJcbmltcG9ydCB7UGxheWVyVHlwZX0gZnJvbSAnLi4vZG9tYWluL3BsYXllci10eXBlJztcclxuaW1wb3J0IHtIcE9yaWVudGF0aW9ufSBmcm9tICcuLi9kb21haW4vaHAtb3JpZW50YXRpb24nO1xyXG5pbXBvcnQge1Jvd0NsZWFyRGlyZWN0aW9ufSBmcm9tICcuLi9kb21haW4vcm93LWNsZWFyLWRpcmVjdGlvbic7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuXHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBzY2VuZTogYW55O1xyXG5cclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIGh1bWFuR3JpZDogTGlnaHRpbmdHcmlkO1xyXG4gICAgcHJpdmF0ZSBodW1hblN3aXRjaGJvYXJkOiBTd2l0Y2hib2FyZDtcclxuICAgIHByaXZhdGUgYWlHcmlkOiBMaWdodGluZ0dyaWQ7XHJcbiAgICBwcml2YXRlIGFpU3dpdGNoYm9hcmQ6IFN3aXRjaGJvYXJkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWUsIGNhbnZhczogdGhpcy5jYW52YXN9KTtcclxuXHJcbiAgICAgICAgdGhpcy5odW1hbkdyaWQgPSBuZXcgTGlnaHRpbmdHcmlkKEhwT3JpZW50YXRpb24uRGVjcmVhc2VzUmlnaHRUb0xlZnQsIFJvd0NsZWFyRGlyZWN0aW9uLlJpZ2h0VG9MZWZ0KTtcclxuICAgICAgICB0aGlzLmh1bWFuU3dpdGNoYm9hcmQgPSBuZXcgU3dpdGNoYm9hcmQodGhpcy5odW1hbkdyaWQsIFBsYXllclR5cGUuSHVtYW4pO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkID0gbmV3IExpZ2h0aW5nR3JpZChIcE9yaWVudGF0aW9uLkRlY3JlYXNlc0xlZnRUb1JpZ2h0LCBSb3dDbGVhckRpcmVjdGlvbi5MZWZ0VG9SaWdodCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkID0gbmV3IFN3aXRjaGJvYXJkKHRoaXMuYWlHcmlkLCBQbGF5ZXJUeXBlLkFpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmh1bWFuR3JpZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGFydCgpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5haVN3aXRjaGJvYXJkLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9TdGFydCgpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgc2t5LnN0YXJ0KCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgc3RhbmRlZU1hbmFnZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbnZhcyBzaG91bGQgaGF2ZSBiZWVuIGhpZGRlbiB1bnRpbCBzZXR1cCBpcyBjb21wbGV0ZS5cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gJzEnOyAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAycyc7XHJcbiAgICB9XHJcblxyXG4gICAgc3RlcChlbGFwc2VkOiBudW1iZXIpIHtcclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgc2t5LnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgZ3JvdW5kLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHVtYW5Td2l0Y2hib2FyZC5zdGVwKGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMuaHVtYW5HcmlkLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWlHcmlkLnN0ZXAoZWxhcHNlZCk7XHJcbiAgICAgICAgdGhpcy5odW1hblN3aXRjaGJvYXJkLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHN0YW5kZWVNYW5hZ2VyLnN0ZXAoZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIGNhbWVyYVdyYXBwZXIuY2FtZXJhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvU3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoc2t5Lmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoZ3JvdW5kLmdyb3VwKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzdGFuZGVlTWFuYWdlci5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuaHVtYW5HcmlkLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5haUdyaWQuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFgoMTIpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnBvc2l0aW9uLnNldFooLTIpO1xyXG4gICAgICAgIHRoaXMuYWlHcmlkLmdyb3VwLnJvdGF0aW9uLnkgPSAtTWF0aC5QSSAvIDMuNTtcclxuXHJcbiAgICAgICAgbGV0IHNwb3RMaWdodENvbG9yID0gMHg5OTk5ZWU7XHJcbiAgICAgICAgbGV0IHNwb3RMaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoc3BvdExpZ2h0Q29sb3IpO1xyXG4gICAgICAgIHNwb3RMaWdodC5wb3NpdGlvbi5zZXQoLTMsIDAuNzUsIDIwKTtcclxuICAgICAgICBzcG90TGlnaHQudGFyZ2V0ID0gdGhpcy5haUdyaWQuZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoc3BvdExpZ2h0KTtcclxuXHJcbiAgICAgICAgY2FtZXJhV3JhcHBlci5jYW1lcmEucG9zaXRpb24uc2V0KDUsIDAuNCwgMTUpO1xyXG4gICAgICAgIGNhbWVyYVdyYXBwZXIubG9va0F0U3RhcnRpbmdGb2N1cygpO1xyXG5cclxuICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjYW1lcmFXcmFwcGVyLnVwZGF0ZVJlbmRlcmVyU2l6ZSh0aGlzLnJlbmRlcmVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5hZGREZWJ1Z0JveCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUgYWRkRGVidWdCb3goKSB7XHJcbiAgICAvLyAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDAuNSwgMC41LCAwLjUpO1xyXG4gICAgLy8gICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHhmZjAwZmZ9KTtcclxuICAgIC8vICAgICBsZXQgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAvLyAgICAgbWVzaC5wb3NpdGlvbi5zZXQoMTUuNSwgMCwgMi4wKTtcclxuICAgIC8vICAgICB0aGlzLnNjZW5lLmFkZChtZXNoKTtcclxuICAgIC8vIH1cclxufVxyXG5leHBvcnQgY29uc3QgdmlldyA9IG5ldyBWaWV3KCk7XHJcbiIsImRlY2xhcmUgY29uc3QgVEhSRUU6IGFueTtcclxuXHJcbi8vIDEpIHRyZWVcclxuY29uc3QgRklMRVNfVE9fUFJFTE9BRCA9IDE7XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG5cclxuICAgIHJlYWRvbmx5IGdyb3VwOiBhbnk7XHJcblxyXG4gICAgcHJpdmF0ZSBncmFzczogYW55O1xyXG5cclxuICAgIHByaXZhdGUgdHJlZXNTcGF3bmVkOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSB0cmVlVGV4dHVyZTogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMzAwLCAzMDApO1xyXG4gICAgICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtlbWlzc2l2ZTogMHgwMjFkMDMsIGVtaXNzaXZlSW50ZW5zaXR5OiAxLjB9KTtcclxuICAgICAgICB0aGlzLmdyYXNzID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmdyYXNzLnJvdGF0aW9uLnggPSAoTWF0aC5QSSAqIDMpIC8gMjtcclxuICAgICAgICB0aGlzLmdyYXNzLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmVlc1NwYXduZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRyZWVUZXh0dXJlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmdyYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGVsYXBzZWQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnRyZWVzU3Bhd25lZCA9PT0gZmFsc2UgJiYgdGhpcy50cmVlVGV4dHVyZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3Bhd25UcmVlKC0yLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5zcGF3blRyZWUoOS41LCAxKTtcclxuICAgICAgICAgICAgdGhpcy5zcGF3blRyZWUoMTQsIDcpO1xyXG4gICAgICAgICAgICB0aGlzLnRyZWVzU3Bhd25lZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWQoc2lnbmFsVGhhdFRleHR1cmVXYXNMb2FkZWQ6IChyZXN1bHQ6IGJvb2xlYW4pID0+IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHRleHR1cmVMb2FkZWRIYW5kbGVyID0gKHRleHR1cmU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRyZWVUZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICAgICAgc2lnbmFsVGhhdFRleHR1cmVXYXNMb2FkZWQodHJ1ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGVycm9ySGFuZGxlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgc2lnbmFsVGhhdFRleHR1cmVXYXNMb2FkZWQoZmFsc2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQoJ3RyZWUucG5nJywgdGV4dHVyZUxvYWRlZEhhbmRsZXIsIHVuZGVmaW5lZCwgZXJyb3JIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEZJTEVTX1RPX1BSRUxPQUQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzcGF3blRyZWUoeDogbnVtYmVyLCB6OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU3ByaXRlTWF0ZXJpYWwoe21hcDogdGhpcy50cmVlVGV4dHVyZX0pO1xyXG4gICAgICAgIGxldCBzcHJpdGUgPSBuZXcgVEhSRUUuU3ByaXRlKG1hdGVyaWFsKTtcclxuICAgICAgICBzcHJpdGUuc2NhbGUuc2V0KDIuNSwgMi41LCAyLjUpO1xyXG4gICAgICAgIHNwcml0ZS5wb3NpdGlvbi5zZXQoeCwgMS4xLCB6KTtcclxuICAgICAgICBzcHJpdGUubWF0ZXJpYWwuY29sb3Iuc2V0UkdCKDAuNSwgMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHNwcml0ZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGdyb3VuZCA9IG5ldyBHcm91bmQoKTsiLCJkZWNsYXJlIGNvbnN0IFRIUkVFOiBhbnk7XHJcblxyXG5jb25zdCBTVEFSVF9aX0FOR0xFID0gLShNYXRoLlBJIC8gMzApO1xyXG5jb25zdCBFTkRfWl9BTkdMRSAgID0gICBNYXRoLlBJIC8gMzA7XHJcbmNvbnN0IFJPVEFUSU9OX1NQRUVEID0gMC4wMDA1O1xyXG5cclxuY2xhc3MgU2t5IHtcclxuXHJcbiAgICByZWFkb25seSBncm91cDogYW55O1xyXG5cclxuICAgIHByaXZhdGUgZG9tZTogYW55O1xyXG4gICAgcHJpdmF0ZSByZHo6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcblxyXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg1MCwgMzIsIDMyKTsgLy8gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDE1MCwgMTUwLCAxNTApO1xyXG4gICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5nZW5lcmF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHttYXA6IHRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlfSk7XHJcbiAgICAgICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgICAgICB0aGlzLmRvbWUubWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xyXG4gICAgICAgIHRoaXMuZG9tZS5wb3NpdGlvbi5zZXQoMTAsIDEwLCAwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmRvbWUpO1xyXG5cclxuICAgICAgICB0aGlzLnJkeiA9IC1ST1RBVElPTl9TUEVFRDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLmRvbWUucm90YXRpb24uc2V0KDAsIDAsIFNUQVJUX1pfQU5HTEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAoZWxhcHNlZDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5kb21lLnJvdGF0aW9uLnNldCgwLCAwLCB0aGlzLmRvbWUucm90YXRpb24ueiArIHRoaXMucmR6KTtcclxuICAgICAgICBpZiAodGhpcy5kb21lLnJvdGF0aW9uLnogPj0gRU5EX1pfQU5HTEUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZHogPSAtUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRvbWUucm90YXRpb24ueiA8PSBTVEFSVF9aX0FOR0xFKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmR6ID0gUk9UQVRJT05fU1BFRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZWQgb246IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE5OTkyNTA1XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2VuZXJhdGVUZXh0dXJlKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHNpemUgPSA1MTI7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHNpemU7XHJcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHNpemUsIHNpemUpO1xyXG4gICAgICAgIGxldCBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCBzaXplKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4wMCwgJyMwMDAwMDAnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC40MCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC43NSwgJyNmZjk1NDQnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC44NSwgJyMxMzFjNDUnKTtcclxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMS4wMCwgJyMxMzFjNDUnKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCBza3kgPSBuZXcgU2t5KCk7Il19
