import Phaser from 'phaser'

const WORLD_WIDTH = 1920
const WORLD_HEIGHT = 1800
const INTERACTION_DISTANCE = 135

type ClientId = 'client-one' | 'client-two'

type ClientDetails = {
  name: string
  role: string
  introduction: string
  spokenTo: boolean
}

export class LevelOneScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image
  private manager!: Phaser.Physics.Arcade.Image

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys!: Record<
    'up' | 'down' | 'left' | 'right',
    Phaser.Input.Keyboard.Key
  >

  private interactKey!: Phaser.Input.Keyboard.Key
  private escapeKey!: Phaser.Input.Keyboard.Key
  private enterKey!: Phaser.Input.Keyboard.Key
  private spaceKey!: Phaser.Input.Keyboard.Key

  private progressText!: Phaser.GameObjects.Text
  private interactionPrompt!: Phaser.GameObjects.Text
  private dialogueContainer!: Phaser.GameObjects.Container
  private hoverTooltip!: Phaser.GameObjects.Container
  private minimap!: Phaser.GameObjects.Graphics

  private controlsEnabled = false
  private dialogueOpen = false
  private unlockControlsAfterDialogue = false
  private levelCompleted = false
  private nearbyClientId: ClientId | null = null
  private pendingClientCompletion: ClientId | null = null
  private exitUnlocked = false
  private nearExit = false
  private unlockExitAfterDialogue = false
  private exitSequenceStarted = false

  private clientSprites = new Map<
    ClientId,
    Phaser.Physics.Arcade.Image
  >()

  private clients: Record<ClientId, ClientDetails> = {
    'client-one': {
      name: 'Alex Morgan',
      role: 'Operations Manager',
      introduction:
        'Our teams are losing time because several important processes still rely on manual spreadsheets.',
      spokenTo: false,
    },
    'client-two': {
      name: 'Jordan Lee',
      role: 'Customer Experience Lead',
      introduction:
        'Customer enquiries are increasing, but our current support process is struggling to keep up.',
      spokenTo: false,
    },
  }

  constructor() {
    super('LevelOneScene')
  }

  preload() {
    this.load.image(
      'player',
      '/assets/characters/npcs/character-04.png'
    )
    this.load.image(
      'manager',
      '/assets/characters/npcs/character-01.png'
    )
    this.load.image(
      'client-one',
      '/assets/characters/npcs/character-02.png'
    )
    this.load.image(
      'client-two',
      '/assets/characters/npcs/character-03.png'
    )

    this.load.image(
      'door-frame',
      '/assets/game/shared/doors/door-frame.png'
    )
    this.load.image(
      'door-left',
      '/assets/game/shared/doors/door-left.png'
    )
    this.load.image(
      'door-right',
      '/assets/game/shared/doors/door-right.png'
    )
    this.load.image(
      'plant',
      '/assets/game/shared/plants/plant-round.png'
    )
    this.load.image(
      'meeting-table',
      '/assets/game/level-1/furniture/meeting-table-small.png'
    )
    this.load.image(
      'chair',
      '/assets/game/level-1/furniture/chair-blue.png'
    )
  }

  create() {
    this.physics.world.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    )
    this.cameras.main.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    )

    this.createRoomShell()
    this.configureKeyboard()

    // The player must exist before any colliders are registered.
    this.createPlayer()
    this.createFurniture()
    this.createCharacters()
    this.createInterface()
    this.createPhysicalEntrance()
    this.startEntranceCinematic()
  }

  override update(time: number) {
    this.updateDepths()
    this.positionInterfaceOnCamera()
    this.updateMinimap()

    if (this.dialogueOpen) {
      this.player.setVelocity(0)

      const keyboardCloseRequested =
        Phaser.Input.Keyboard.JustDown(this.escapeKey) ||
        Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey)

      if (keyboardCloseRequested) {
        this.closeDialogue()
      }

      return
    }

    if (!this.controlsEnabled) {
      this.player.setVelocity(0)
      return
    }

    this.updateMovement(time)
    this.updateNearbyClient()
    this.updateExitInteraction()

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.nearExit) {
        this.startExitCinematic()
      } else if (this.nearbyClientId) {
        this.speakToClient(this.nearbyClientId)
      }
    }
  }

  private createRoomShell() {
    this.cameras.main.setBackgroundColor('#f4ede1')

    this.add
      .rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        0xf4ede1
      )
      .setDepth(-1000)

    const floor = this.add.graphics().setDepth(-999)

    // Neutral cream floor until the approved Level 1 map is designed.
    // Subtle lines provide movement reference without a checkerboard.
    const tileSize = 96
    floor.lineStyle(1, 0xc98a3e, 0.08)
    for (let x = 0; x <= WORLD_WIDTH; x += tileSize) {
      floor.lineBetween(x, 0, x, WORLD_HEIGHT)
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += tileSize) {
      floor.lineBetween(0, y, WORLD_WIDTH, y)
    }

    const architecture = this.add.graphics().setDepth(-980)

    architecture.fillStyle(0x1f4e79)
    architecture.fillRect(0, 0, WORLD_WIDTH, 72)
    architecture.fillRect(0, 0, 48, WORLD_HEIGHT)
    architecture.fillRect(
      WORLD_WIDTH - 48,
      0,
      48,
      WORLD_HEIGHT
    )

    architecture.fillStyle(0xc98a3e)
    architecture.fillRect(0, 72, WORLD_WIDTH, 18)

    // Stylised office windows along the top wall.
    architecture.fillStyle(0x7eb6e0, 0.75)
    architecture.fillRoundedRect(180, 18, 420, 38, 12)
    architecture.fillRoundedRect(750, 18, 420, 38, 12)
    architecture.fillRoundedRect(1320, 18, 420, 38, 12)

    architecture.lineStyle(7, 0x2c2c2a)
    architecture.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  }

  private configureKeyboard() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.movementKeys = this.input.keyboard!.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as Record<
      'up' | 'down' | 'left' | 'right',
      Phaser.Input.Keyboard.Key
    >

    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    )
    this.escapeKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    )
    this.enterKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    )
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )
  }

  private createPlayer() {
    this.player = this.physics.add
      .image(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT - 145,
        'player'
      )
      .setDisplaySize(82, 110)

    this.player.setCollideWorldBounds(true)
    this.player.setDepth(this.player.y)
  }

  private createFurniture() {
    this.createMeetingArea(480, 500)
    this.createMeetingArea(1440, 500)
    this.createMeetingArea(960, 860)

    this.createPlant(125, 150)
    this.createPlant(WORLD_WIDTH - 125, 150)
    this.createPlant(125, WORLD_HEIGHT - 240)
    this.createPlant(WORLD_WIDTH - 125, WORLD_HEIGHT - 240)
    this.createPlant(330, 1120)
    this.createPlant(WORLD_WIDTH - 330, 1120)
  }

  private createMeetingArea(x: number, y: number) {
    const table = this.physics.add
      .staticImage(x, y, 'meeting-table')
      .setDisplaySize(275, 258)
      .setDepth(y)

    table.refreshBody()
    this.physics.add.collider(this.player, table)

    // The source chair faces downward at angle 0.
    // Each rotation below turns it toward the nearby table.
    const chairs = [
      { x, y: y - 180, angle: 0 },
      { x, y: y + 190, angle: 180 },
      { x: x - 190, y: y + 5, angle: -90 },
      { x: x + 190, y: y + 5, angle: 90 },
    ]

    for (const chairData of chairs) {
      this.add
        .image(chairData.x, chairData.y, 'chair')
        .setDisplaySize(70, 78)
        .setAngle(chairData.angle)
        .setDepth(chairData.y)
    }
  }

  private createPlant(x: number, y: number) {
    const plant = this.physics.add
      .staticImage(x, y, 'plant')
      .setDisplaySize(112, 112)
      .setDepth(y)

    plant.refreshBody()
    this.physics.add.collider(this.player, plant)
  }

  private createCharacters() {
    this.manager = this.physics.add
      .image(
        WORLD_WIDTH / 2 - 260,
        1050,
        'manager'
      )
      .setDisplaySize(82, 110)
      .setImmovable(true)

    this.physics.add.collider(this.player, this.manager)

    const clientOne = this.physics.add
      .staticImage(620, 1040, 'client-one')
      .setDisplaySize(82, 110)
    clientOne.refreshBody()

    const clientTwo = this.physics.add
      .staticImage(1310, 1010, 'client-two')
      .setDisplaySize(82, 110)
    clientTwo.refreshBody()

    this.clientSprites.set('client-one', clientOne)
    this.clientSprites.set('client-two', clientTwo)

    this.physics.add.collider(this.player, clientOne)
    this.physics.add.collider(this.player, clientTwo)

    this.configureNpcHover(
      this.manager,
      'Manager',
      'Your IBM manager and guide'
    )
    this.configureNpcHover(
      clientOne,
      this.clients['client-one'].name,
      this.clients['client-one'].role
    )
    this.configureNpcHover(
      clientTwo,
      this.clients['client-two'].name,
      this.clients['client-two'].role
    )
  }

  private createPhysicalEntrance() {
    const x = WORLD_WIDTH / 2
    const y = WORLD_HEIGHT - 72

    this.add
      .image(x, y, 'door-frame')
      .setDisplaySize(340, 185)
      .setDepth(WORLD_HEIGHT + 30)
    this.add
      .image(x - 65, y + 10, 'door-left')
      .setDisplaySize(130, 160)
      .setDepth(WORLD_HEIGHT + 20)
    this.add
      .image(x + 65, y + 10, 'door-right')
      .setDisplaySize(130, 160)
      .setDepth(WORLD_HEIGHT + 20)
  }

  private startEntranceCinematic() {
    const camera = this.cameras.main
    const screenWidth = camera.width
    const screenHeight = camera.height

    camera.setZoom(1.72)
    // Force the camera to the entrance before measuring its world view.
    // Without this, the full-screen door overlay can be placed off-camera.
    camera.centerOn(this.player.x, this.player.y)
    camera.startFollow(this.player, true, 0.1, 0.1)

    // The overlay is drawn in screen-sized local coordinates and then
    // positioned over the current camera view.
    const overlay = this.add
      .container(0, 0)
      .setDepth(30000)

    const darkness = this.add
      .rectangle(
        0,
        0,
        screenWidth,
        screenHeight,
        0x111820
      )
      .setOrigin(0)

    // These are intentionally taller than the viewport. They slide away
    // without changing scale, so they remain recognisable doors.
    const leftDoor = this.add
      .image(-45, screenHeight / 2, 'door-left')
      .setOrigin(0, 0.5)
      .setDisplaySize(
        screenWidth / 2 + 90,
        screenHeight * 1.22
      )

    const rightDoor = this.add
      .image(
        screenWidth + 45,
        screenHeight / 2,
        'door-right'
      )
      .setOrigin(1, 0.5)
      .setDisplaySize(
        screenWidth / 2 + 90,
        screenHeight * 1.22
      )

    const upperFrame = this.add
      .rectangle(
        screenWidth / 2,
        22,
        screenWidth,
        44,
        0x1f4e79
      )
      .setStrokeStyle(7, 0x2c2c2a)

    const centreSeam = this.add
      .rectangle(
        screenWidth / 2,
        screenHeight / 2,
        10,
        screenHeight,
        0x2c2c2a
      )

    overlay.add([
      darkness,
      leftDoor,
      rightDoor,
      upperFrame,
      centreSeam,
    ])

    this.positionScreenOverlay(overlay)

    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: leftDoor,
        x: -screenWidth / 2 - 160,
        duration: 1850,
        ease: 'Cubic.easeInOut',
      })

      this.tweens.add({
        targets: rightDoor,
        x: screenWidth * 1.5 + 160,
        duration: 1850,
        ease: 'Cubic.easeInOut',
      })

      this.tweens.add({
        targets: centreSeam,
        alpha: 0,
        duration: 350,
      })

      this.tweens.add({
        targets: [darkness, upperFrame],
        alpha: 0,
        duration: 1100,
        delay: 500,
        onComplete: () => {
          overlay.destroy(true)
          this.walkPlayerIntoRoom()
        },
      })
    })
  }

  private positionScreenOverlay(
    overlay: Phaser.GameObjects.Container
  ) {
    const camera = this.cameras.main
    const inverseZoom = 1 / camera.zoom

    overlay
      .setScale(inverseZoom)
      .setPosition(
        camera.worldView.left,
        camera.worldView.top
      )
  }

  private walkPlayerIntoRoom() {
    const camera = this.cameras.main

    const walkingBob = this.tweens.add({
      targets: this.player,
      angle: {
        from: -2.5,
        to: 2.5,
      },
      duration: 240,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.player,
      y: 1280,
      duration: 4300,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.player.setDepth(this.player.y)
      },
      onComplete: () => {
        walkingBob.stop()
        this.player.setAngle(0)
        this.walkManagerToPlayer()
      },
    })

    this.tweens.add({
      targets: camera,
      zoom: 1.38,
      duration: 4300,
      ease: 'Sine.easeInOut',
    })
  }

  private walkManagerToPlayer() {
    const managerBob = this.tweens.add({
      targets: this.manager,
      angle: {
        from: -2,
        to: 2,
      },
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.manager,
      x: this.player.x - 105,
      y: this.player.y - 130,
      duration: 2300,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.manager.setDepth(this.manager.y)
      },
      onComplete: () => {
        managerBob.stop()
        this.manager.setAngle(0)

        this.openDialogue(
          'Manager',
          'Welcome to IBM Consultancy 101! Explore the networking room, learn about each potential client and speak to everyone before continuing.',
          true
        )
      },
    })
  }

  private updateMovement(time: number) {
    const speed = 235

    this.player.setVelocity(0)

    const left =
      this.cursors.left.isDown ||
      this.movementKeys.left.isDown
    const right =
      this.cursors.right.isDown ||
      this.movementKeys.right.isDown
    const up =
      this.cursors.up.isDown ||
      this.movementKeys.up.isDown
    const down =
      this.cursors.down.isDown ||
      this.movementKeys.down.isDown

    if (left) {
      this.player.setVelocityX(-speed)
    } else if (right) {
      this.player.setVelocityX(speed)
    }

    if (up) {
      this.player.setVelocityY(-speed)
    } else if (down) {
      this.player.setVelocityY(speed)
    }

    this.player.body?.velocity.normalize().scale(speed)

    const isMoving = left || right || up || down

    if (isMoving) {
      // The current character is a single image rather than a walk-cycle
      // sprite sheet, so a small alternating lean adds a walking motion.
      this.player.setAngle(Math.sin(time / 85) * 2.6)
    } else {
      this.player.setAngle(0)
    }
  }

  private updateDepths() {
    this.player?.setDepth(this.player.y)
    this.manager?.setDepth(this.manager.y)

    for (const sprite of this.clientSprites.values()) {
      sprite.setDepth(sprite.y)
    }
  }

  private createInterface() {
    this.progressText = this.add
      .text(0, 0, 'Clients: 0 / 2', {
        color: '#1f4e79',
        backgroundColor: '#f7fafc',
        fontFamily: 'Arial',
        fontSize: '15px',
        fontStyle: 'bold',
        padding: {
          x: 11,
          y: 8,
        },
      })
      .setStroke('#2c2c2a', 1)
      .setDepth(20000)
      .setVisible(false)

    this.interactionPrompt = this.add
      .text(0, 0, 'Press E to speak', {
        color: '#ffffff',
        backgroundColor: '#1f4e79',
        fontFamily: 'Arial',
        fontSize: '16px',
        fontStyle: 'bold',
        padding: {
          x: 14,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setDepth(20000)
      .setVisible(false)

    this.hoverTooltip = this.add
      .container(0, 0)
      .setDepth(15000)
      .setVisible(false)

    this.dialogueContainer = this.add
      .container(0, 0)
      .setDepth(25000)
      .setVisible(false)

    this.minimap = this.add
      .graphics()
      .setDepth(20000)
      .setVisible(false)
  }

  private positionInterfaceOnCamera() {
    const camera = this.cameras.main
    const inverseZoom = 1 / camera.zoom
    const view = camera.worldView

    this.progressText
      ?.setScale(inverseZoom)
      .setPosition(
        view.left + 18 * inverseZoom,
        view.top + 18 * inverseZoom
      )

    this.interactionPrompt
      ?.setScale(inverseZoom)
      .setPosition(
        view.centerX,
        view.bottom - 38 * inverseZoom
      )

    this.minimap
      ?.setScale(inverseZoom)
      .setPosition(
        view.right - 154 * inverseZoom,
        view.top + 16 * inverseZoom
      )

    if (this.dialogueContainer?.visible) {
      this.dialogueContainer
        .setScale(inverseZoom)
        .setPosition(
          view.centerX,
          view.bottom - 112 * inverseZoom
        )
    }
  }

  private configureNpcHover(
    npc: Phaser.Physics.Arcade.Image,
    name: string,
    role: string
  ) {
    npc.setInteractive({ useHandCursor: true })

    npc.on('pointerover', () => {
      this.showTooltip(npc.x, npc.y - 92, name, role)
    })
    npc.on('pointerout', () => {
      this.hoverTooltip.setVisible(false)
    })
  }

  private showTooltip(
    x: number,
    y: number,
    name: string,
    role: string
  ) {
    this.hoverTooltip.removeAll(true)

    const background = this.add
      .rectangle(0, 0, 235, 74, 0xf7fafc, 0.98)
      .setStrokeStyle(4, 0x2c2c2a)
    const nameText = this.add
      .text(0, -14, name, {
        color: '#1f4e79',
        fontFamily: 'Arial',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    const roleText = this.add
      .text(0, 13, role, {
        color: '#2c2c2a',
        fontFamily: 'Arial',
        fontSize: '13px',
      })
      .setOrigin(0.5)

    this.hoverTooltip
      .add([background, nameText, roleText])
      .setPosition(x, y)
      .setVisible(true)
  }

  private updateNearbyClient() {
    let nearestId: ClientId | null = null
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const [clientId, sprite] of this.clientSprites) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        sprite.x,
        sprite.y
      )

      if (
        distance < INTERACTION_DISTANCE &&
        distance < nearestDistance
      ) {
        nearestId = clientId
        nearestDistance = distance
      }
    }

    this.nearbyClientId = nearestId

    if (nearestId) {
      this.interactionPrompt
        .setText(
          `Press E to speak with ${this.clients[nearestId].name}`
        )
        .setVisible(true)
    } else {
      this.interactionPrompt.setVisible(false)
    }
  }

  private speakToClient(clientId: ClientId) {
    const client = this.clients[clientId]
    this.pendingClientCompletion = client.spokenTo
      ? null
      : clientId

    this.openDialogue(
      client.name,
      client.introduction,
      false
    )
  }

  private updateProgress() {
    const spokenCount = Object.values(this.clients).filter(
      (client) => client.spokenTo
    ).length

    this.progressText.setText(`Clients: ${spokenCount} / 2`)

    if (spokenCount === 2 && !this.levelCompleted) {
      this.levelCompleted = true
      this.time.delayedCall(450, () => {
        this.unlockExitAfterDialogue = true
        this.openDialogue(
          'Manager',
          'Level 1 complete! Outreach is ready to unlock. Return to the entrance and leave the room when you are ready.',
          false
        )
      })
    }
  }

  private openDialogue(
    speaker: string,
    message: string,
    unlockControlsAfterClosing: boolean
  ) {
    this.dialogueOpen = true
    this.unlockControlsAfterDialogue =
      unlockControlsAfterClosing
    this.interactionPrompt.setVisible(false)
    this.dialogueContainer.removeAll(true)

    const panelWidth = Math.min(
      620,
      this.cameras.main.width - 54
    )
    const panelHeight = 178

    const panel = this.add
      .rectangle(
        0,
        0,
        panelWidth,
        panelHeight,
        0xf7fafc,
        0.98
      )
      .setStrokeStyle(5, 0x2c2c2a)
      .setInteractive({ useHandCursor: true })

    const speakerText = this.add
      .text(
        -panelWidth / 2 + 24,
        -panelHeight / 2 + 18,
        speaker,
        {
          color: '#1f4e79',
          fontFamily: 'Arial',
          fontSize: '20px',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0)

    const messageText = this.add
      .text(
        -panelWidth / 2 + 24,
        -panelHeight / 2 + 53,
        message,
        {
          color: '#2c2c2a',
          fontFamily: 'Arial',
          fontSize: '16px',
          lineSpacing: 5,
          wordWrap: {
            width: panelWidth - 48,
          },
        }
      )
      .setOrigin(0)

    const continueButton = this.add
      .text(
        panelWidth / 2 - 20,
        panelHeight / 2 - 16,
        'CONTINUE',
        {
          color: '#ffffff',
          backgroundColor: '#5b8c4a',
          fontFamily: 'Arial',
          fontSize: '14px',
          fontStyle: 'bold',
          padding: {
            x: 13,
            y: 7,
          },
        }
      )
      .setOrigin(1)
      .setInteractive({ useHandCursor: true })

    panel.on('pointerup', () => {
      this.closeDialogue()
    })
    continueButton.on('pointerup', () => {
      this.closeDialogue()
    })

    this.dialogueContainer
      .add([
        panel,
        speakerText,
        messageText,
        continueButton,
      ])
      .setVisible(true)

    this.positionInterfaceOnCamera()
  }

  private closeDialogue() {
    if (!this.dialogueOpen) {
      return
    }

    this.dialogueOpen = false
    this.dialogueContainer.setVisible(false)

    // A conversation only counts after the user has actually finished and
    // closed that client's dialogue, not immediately when E is pressed.
    if (this.pendingClientCompletion) {
      const completedClientId = this.pendingClientCompletion
      this.pendingClientCompletion = null
      this.clients[completedClientId].spokenTo = true
      this.updateProgress()
    }

    if (this.unlockControlsAfterDialogue) {
      this.controlsEnabled = true
      this.progressText.setVisible(true)
      this.minimap.setVisible(true)
      this.unlockControlsAfterDialogue = false
    }

    if (this.unlockExitAfterDialogue) {
      this.exitUnlocked = true
      this.unlockExitAfterDialogue = false
    }
  }

  private updateExitInteraction() {
    if (!this.exitUnlocked || this.exitSequenceStarted) {
      this.nearExit = false
      return
    }

    const exitX = WORLD_WIDTH / 2
    const exitY = WORLD_HEIGHT - 145
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      exitX,
      exitY
    )

    this.nearExit = distance < 155

    if (this.nearExit) {
      this.nearbyClientId = null
      this.interactionPrompt
        .setText('Press E to leave Level 1')
        .setVisible(true)
    }
  }

  private startExitCinematic() {
    if (this.exitSequenceStarted) {
      return
    }

    this.exitSequenceStarted = true
    this.controlsEnabled = false
    this.nearExit = false
    this.interactionPrompt.setVisible(false)
    this.progressText.setVisible(false)
    this.minimap.setVisible(false)

    const camera = this.cameras.main
    const walkingBob = this.tweens.add({
      targets: this.player,
      angle: { from: -2.5, to: 2.5 },
      duration: 230,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.player,
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT - 70,
      duration: 1800,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        walkingBob.stop()
        this.player.setAngle(0)
        this.closeDoorsAndReturnToDashboard()
      },
    })

    this.tweens.add({
      targets: camera,
      zoom: 1.68,
      duration: 1800,
      ease: 'Sine.easeInOut',
    })
  }

  private closeDoorsAndReturnToDashboard() {
    const camera = this.cameras.main
    const screenWidth = camera.width
    const screenHeight = camera.height
    const overlay = this.add
      .container(0, 0)
      .setDepth(30000)

    const darkness = this.add
      .rectangle(0, 0, screenWidth, screenHeight, 0x111820)
      .setOrigin(0)
      .setAlpha(0)

    const leftDoor = this.add
      .image(-screenWidth / 2 - 160, screenHeight / 2, 'door-left')
      .setOrigin(0, 0.5)
      .setDisplaySize(screenWidth / 2 + 90, screenHeight * 1.22)

    const rightDoor = this.add
      .image(screenWidth * 1.5 + 160, screenHeight / 2, 'door-right')
      .setOrigin(1, 0.5)
      .setDisplaySize(screenWidth / 2 + 90, screenHeight * 1.22)

    const centreSeam = this.add
      .rectangle(screenWidth / 2, screenHeight / 2, 10, screenHeight, 0x2c2c2a)
      .setAlpha(0)

    overlay.add([darkness, leftDoor, rightDoor, centreSeam])
    this.positionScreenOverlay(overlay)

    this.tweens.add({
      targets: leftDoor,
      x: -45,
      duration: 1500,
      ease: 'Cubic.easeInOut',
    })
    this.tweens.add({
      targets: rightDoor,
      x: screenWidth + 45,
      duration: 1500,
      ease: 'Cubic.easeInOut',
    })
    this.tweens.add({
      targets: darkness,
      alpha: 1,
      duration: 1300,
      delay: 300,
    })
    this.tweens.add({
      targets: centreSeam,
      alpha: 1,
      duration: 350,
      delay: 1150,
      onComplete: () => {
        window.location.assign('/dashboard?completed=level-1')
      },
    })
  }

  private updateMinimap() {
    if (!this.minimap?.visible || !this.player) {
      return
    }

    const width = 138
    const height = 96
    const scaleX = width / WORLD_WIDTH
    const scaleY = height / WORLD_HEIGHT

    this.minimap.clear()
    this.minimap.fillStyle(0xf7fafc, 0.97)
    this.minimap.fillRoundedRect(0, 0, width, height, 10)
    this.minimap.lineStyle(3, 0x2c2c2a)
    this.minimap.strokeRoundedRect(0, 0, width, height, 10)

    // Simplified table markers make the map feel useful.
    this.minimap.fillStyle(0xc98a3e, 0.35)
    this.minimap.fillCircle(
      480 * scaleX,
      500 * scaleY,
      8
    )
    this.minimap.fillCircle(
      1440 * scaleX,
      500 * scaleY,
      8
    )
    this.minimap.fillCircle(
      960 * scaleX,
      860 * scaleY,
      8
    )

    this.drawMinimapDot(
      this.player.x * scaleX,
      this.player.y * scaleY,
      0x7eb6e0,
      5
    )
    this.drawMinimapDot(
      this.manager.x * scaleX,
      this.manager.y * scaleY,
      0x5b8c4a,
      4
    )

    for (const [clientId, sprite] of this.clientSprites) {
      const colour = this.clients[clientId].spokenTo
        ? 0x8b8b87
        : 0xc98a3e

      this.drawMinimapDot(
        sprite.x * scaleX,
        sprite.y * scaleY,
        colour,
        4
      )
    }
  }

  private drawMinimapDot(
    x: number,
    y: number,
    colour: number,
    radius: number
  ) {
    this.minimap.fillStyle(colour)
    this.minimap.fillCircle(x, y, radius)
    this.minimap.lineStyle(1, 0x2c2c2a)
    this.minimap.strokeCircle(x, y, radius)
  }
}
