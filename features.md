# Fantasy Coin Collector - Feature Guide

## 🌍 Core Mechanics (Common to All Levels)

### **Controls & Movement**
*   **Dual Input Support**:
    *   **Desktop**: WASD to Move, Arrow Keys to Aim, **Spacebar** to Dash.
    *   **Mobile**: Left Stick to Move, Right Stick to Aim, **⚡ Button** to Dash.
*   **Dash Ability**: A high-speed dodge maneuver that ignores enemy collisions (2-second cooldown).
*   **Player Physics**: Smooth vector-based movement with wall collision and sliding.

### **Gameplay Systems**
*   **Health**: Player starts with **3 Hearts**. Getting hit triggers invincibility frames and screen shake.
*   **Combo System**: Rapidly collecting coins builds a **Combo Multiplier** (x2, x3, etc.), increasing score and pitch of audio effects.
*   **Powerups**:
    *   **Speed Potion (Green S)**: Grants 1.8x speed for 5 seconds.
    *   **Shield (Cyan H)**: Blocks the next instance of damage completely.
*   **Golden Coin**: a rare (1%) treasure that awards **500 Points** and a unique sound.
*   **Visual Polish**: Floating Combat Text (`+10`, `-1 HP`) and smooth **Level Transition** animations.
*   **Audio Engine**: Custom **Web Audio API** with toggle support (Pause Menu).

### **Meta-Progression (Persistent)**
*   **High Score**: Automatically saves your best score to the browser.
*   **Lifetime Stats**: Tracks Total Coins Collected and Total Deaths across all sessions.
*   **Achievements**: Unlocks permanent badges for milestones:
    *   *Pocket Money* (50 Coins)
    *   *Coin Hoarder* (500 Coins)
    *   *Survivor* (Reach Level 5)
    *   *Champion* (Beat Level 10)

---

## 🗺️ Level Progression (The Campaign)

The game scales in difficulty as you advance. Completing a level (collecting all coins) opens a **Portal** to the next stage.

### **Level Specifics**

| Level Range | New Features & Threats |
| :--- | :--- |
| **All Levels** | **Procedural Map**: Walls and obstacles are randomly generated every time. Wall density increases with Level. |
| **Level 1 - 2** | **The Basics**: <br>• **Enemies**: Red **Chasers** only. Slow speed.<br>• **Goal**: Learn to use walls to block Chasers. |
| **Level 3** | **Ghost Introduction**: <br>• **New Enemy**: **Purple Ghosts**. <br>• **Ability**: Ghosts fly *through* walls, forcing the player to keep moving and not hide. |
| **Level 4** | **Patroller Introduction**: <br>• **New Enemy**: **Yellow Patrollers**. <br>• **Ability**: They move back and forth between points, blocking off corridors and creating hazards. |
| **Level 5 - 9** | **The Gauntlet**: <br>• Mixed enemy types (Chasers, Ghosts, Patrollers).<br>• Enemy Speed and Spawn Count increases significantly.<br>• Map becomes more complex (more walls). |
| **Level 10** | **The Final Challenge**: <br>• Maximum Difficulty.<br>• Completing this level triggers the **Victory Screen** and awards the *Champion* badge. |
| **Level 11+** | **Endless Mode**: <br>• The game continues indefinitely for high-score chasers. |
