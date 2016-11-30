import {Npc} from './npc';
import {NpcLocation, FocusPoint} from './npc-location';
import {GameStateType, gameState} from '../../game-state';

class CrowdStats {

    constructor() {
        //
    }

    start() {
        //
    }

    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    giveInitialDirection(npc: Npc) {
        switch (gameState.getCurrent()) {
            case GameStateType.Playing:
                this.moveNpcOffScreen(npc);
                break;
            case GameStateType.Intro:
                this.introTeleportOntoWalkway(npc);
                break;
            default:
                console.log('should not get here');
        }
    }

    private moveNpcOffScreen(npc: Npc) {
        let offscreen = Math.floor(Math.random() * 2);
        if (offscreen == 0) {
            npc.teleportTo(NpcLocation.OffLeft);
            npc.addWaypoint(NpcLocation.BuildingLeft);
        } else {
            npc.teleportTo(NpcLocation.OffRight);
            npc.addWaypoint(NpcLocation.BuildingRight);
        }
    }

    private introTeleportOntoWalkway(npc: Npc) {
        let walkway = Math.floor(Math.random() * 3); // 3 = Total number of Building* locations
        switch (walkway) {
            case 0: // BuildingLeft
                this.introTeleportOntoBuildingLeft(npc);
                break;
            case 1: // BuildingRight
                this.introTeleportOntoBuildingRight(npc);
                break;
            case 2: // BuildingMiddle
                this.introTeleportOntoBuildingMiddle(npc);
                break;
            default:
                console.log('should not get here');
        }
    }

    private introTeleportOntoBuildingLeft(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingLeft);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    private introTeleportOntoBuildingRight(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingRight);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    private introTeleportOntoBuildingMiddle(npc: Npc) {
        npc.teleportTo(NpcLocation.BuildingRight);
        let direction = Math.floor(Math.random() * 2);
        if (direction === 0) { // Go left
            npc.addWaypoint(NpcLocation.OffLeft);
        } else { // Go right
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    giveDirection(npc: Npc) {
        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                this.giveDirectionIntro(npc);
                break;
            case GameStateType.Playing:
                this.giveDirectionPlaying(npc);
                break;
            default:
                console.log('should not get here');
        }
    }

    /**
     * Have an offscreen NPC walk to the middle and them back offscreen.
     */
    private giveDirectionIntro(npc: Npc) {
        let side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffLeft);
        } else {
            npc.addWaypoint(NpcLocation.BuildingMiddle);
            npc.addWaypoint(NpcLocation.OffRight);
        }
    }

    private giveDirectionPlaying(npc: Npc) {
        let action = Math.floor(Math.random() * 10);
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
    }

    private giveDirectionPlayingStand(npc: Npc) {
        let side = Math.floor(Math.random() * 2);
        if (side === 0) {
            npc.standFacing(FocusPoint.BuildingRight, 15000);
        } else {
            npc.standFacing(FocusPoint.BuildingLeft, 15000);
        }
    }

    private giveDirectionPlayingMove(npc: Npc) {
        let where = Math.floor(Math.random() * 26);
        switch (where) {
            case 0:
                npc.addWaypoint(NpcLocation.OffLeft);
                break;
            case 1:
                npc.addWaypoint(NpcLocation.OffRight);
                break;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                npc.addWaypoint(NpcLocation.BuildingLeft);
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                npc.addWaypoint(NpcLocation.BuildingRight);
                break;
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                npc.addWaypoint(NpcLocation.BuildingMiddle);
                break;
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                npc.addWaypoint(NpcLocation.Middle);
                break;
            default:
                console.log('should not get here');
        }
    }
}
export const crowdStats = new CrowdStats();