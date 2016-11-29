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
        } else {
            npc.teleportTo(NpcLocation.OffRight);
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
        // TODO: Use probability to determine what to do next.

        // let side = Math.floor(Math.random() * 2);
        // if (side === 0) {
        //     npc.standFacing(FocusPoint.BuildingRight, 10000);
        // } else {
        //     npc.standFacing(FocusPoint.BuildingLeft, 10000);
        // }

        // TODO: Have it walk somewhere
        // npc.addWaypoint(NpcLocation.BuildingMiddle);
    }

    private giveDirectionPlayingStand(npc: Npc) {
        //
    }

    private gitDirectionPlayingMove(npc: Npc) {
        //
    }
}
export const crowdStats = new CrowdStats();