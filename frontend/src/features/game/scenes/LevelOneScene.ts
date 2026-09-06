import Phaser from 'phaser'
import { LevelOneEffects } from '../effects/LevelOneEffects'
import {
  ClientDialogueController,
  type ClientDefinition,
} from '../dialogue/ClientDialogueController'

const WORLD_WIDTH = 1440
const WORLD_HEIGHT = 720
const FLOOR_TOP = 315
const FLOOR_BOTTOM = 704
const PLAYER_SPEED = 220
const CHARACTER_WIDTH = 142
const CHARACTER_HEIGHT = 205

type ManagerDialogueStep = {
  message: string
  onContinue: () => void
}

export class LevelOneScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image
  private manager!: Phaser.Physics.Arcade.Image
  private effects!: LevelOneEffects
  private goodClient!: Phaser.GameObjects.Image
  private badClient!: Phaser.GameObjects.Image

  private clientDialogue?: ClientDialogueController

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>

  private controlsEnabled = false
  private interfaceOpen = false

  private homeButton!: Phaser.GameObjects.Container
  private notebookButton!: Phaser.GameObjects.Container

  private managerPanel?: Phaser.GameObjects.Container
  private managerReplyInput?: Phaser.GameObjects.DOMElement
  private menuPanel?: Phaser.GameObjects.Container
  private notebookPanel?: Phaser.GameObjects.Container
  private notebookInput?: Phaser.GameObjects.DOMElement

  private interfaceCamera!: Phaser.Cameras.Scene2D.Camera
  private obstacleZones: Phaser.GameObjects.Zone[] = []

  private notes = ''

  constructor() {
    super('LevelOneScene')
  }

  preload(): void {
    this.load.image('player', '/assets/characters/npcs/character-03.png')
    this.load.image('manager', '/assets/characters/npcs/character-04.png')
    this.load.image('good-client', '/assets/characters/npcs/character-01.png')
    this.load.image('bad-client', '/assets/characters/npcs/character-02.png')
    this.load.image(
      'round-table',
      '/assets/game/level-1/furniture/level-one-round-table.png'
    )
    this.load.image(
      'couch',
      '/assets/game/level-1/furniture/level-one-couch.png'
    )
    this.load.image(
      'plant',
      '/assets/game/level-1/furniture/level-one-plant.png'
    )
  }

  create(): void {
    this.physics.world.setBounds(
      0,
      FLOOR_TOP,
      WORLD_WIDTH,
      FLOOR_BOTTOM - FLOOR_TOP
    )

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.setBackgroundColor('#efe1c7')

    this.effects = new LevelOneEffects(this)

    this.createRoom()
    this.createFurniture()
    this.createPlayer()
    this.createCharacters()
    this.createCollisions()

    this.effects.addCharacterShadow(this.player, 76)
    this.effects.addCharacterShadow(this.manager, 72)
    this.effects.addIdleBreathing(this.manager, 200)

    this.effects.addWindowAmbience(295, 1145, 165)
    this.effects.playElevatorSweep(WORLD_WIDTH / 2, WORLD_HEIGHT)

    /*
     * These are the objects that belong to the room.
     * The separate interface camera ignores them.
     */
    const worldObjects = [...this.children.list]

    this.configureKeyboard()
    this.createInterface()
    this.createInterfaceCamera(worldObjects)

    const clients: ClientDefinition[] = [
      {
        name: 'Jordan Lee',
        texture: 'good-client',
        personaId: 'test-level-1',
        sprite: this.goodClient,
      },
      {
        name: 'Morgan Blake',
        texture: 'bad-client',
        personaId: 'test-level-2',
        sprite: this.badClient,
      },
    ]

    this.clientDialogue = new ClientDialogueController({
      scene: this,
      player: this.player,
      clients,
      effects: this.effects,
      mainCamera: this.cameras.main,
      interfaceCamera: this.interfaceCamera,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,

      onOpen: () => {
        this.interfaceOpen = true
        this.controlsEnabled = false
      },

      onClose: () => {
        this.interfaceOpen = false
        this.controlsEnabled = true
      },
    })

    this.startArrivalSequence()
  }

  override update(): void {
    if (!this.player) return

    if (!this.controlsEnabled || this.interfaceOpen) {
      this.player.setVelocity(0)
      this.player.setAngle(0)
      this.effects.updateWalking(this.player, false, this.time.now)
      this.clientDialogue?.hidePrompt()
      return
    }

    this.updateMovement()
    this.updateCharacterDepths()
    this.clientDialogue?.update()
  }

  private configureKeyboard(): void {
    const keyboard = this.input.keyboard

    if (!keyboard) {
      throw new Error('Keyboard controls are unavailable.')
    }

    this.input.setTopOnly(true)
    this.cursors = keyboard.createCursorKeys()

    this.wasd = keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as typeof this.wasd
  }

  private createInterfaceCamera(
    worldObjects: Phaser.GameObjects.GameObject[]
  ): void {
    this.interfaceCamera = this.cameras.add(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      false,
      'InterfaceCamera'
    )

    this.interfaceCamera.setBackgroundColor('rgba(0, 0, 0, 0)')
    this.interfaceCamera.ignore(worldObjects)
    this.cameras.main.ignore([this.homeButton, this.notebookButton])
  }

  private createRoom(): void {
    this.add
      .rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        0xefe1c7
      )
      .setDepth(0)

    const room = this.add.graphics().setDepth(1)

    room.fillStyle(0x2c2c2a)
    room.fillRect(0, 0, WORLD_WIDTH, 10)
    room.fillRect(0, 0, 10, WORLD_HEIGHT)
    room.fillRect(WORLD_WIDTH - 10, 0, 10, WORLD_HEIGHT)
    room.fillRect(0, WORLD_HEIGHT - 10, WORLD_WIDTH, 10)

    room.fillStyle(0x956127)
    room.fillRect(10, FLOOR_TOP - 6, WORLD_WIDTH - 20, 12)

    this.createWindow(295, 165)
    this.createWindow(1145, 165)
    this.createBanner()
    this.createElevatorThreshold()
  }

  private createWindow(x: number, y: number): void {
    const graphics = this.add.graphics().setDepth(2)

    graphics.fillStyle(0xc7e5f3)
    graphics.fillRect(x - 155, y - 78, 310, 156)

    graphics.lineStyle(5, 0x2c2c2a)
    graphics.strokeRect(x - 155, y - 78, 310, 156)
    graphics.lineBetween(x, y - 78, x, y + 78)
    graphics.lineBetween(x - 155, y, x + 155, y)
  }

  private createBanner(): void {
    this.add
      .rectangle(WORLD_WIDTH / 2, 105, 500, 90, 0x477493)
      .setStrokeStyle(5, 0x2c2c2a)
      .setDepth(3)

    this.add
      .text(WORLD_WIDTH / 2, 105, 'Find a Lead', {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontSize: '38px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(4)
  }

  private createElevatorThreshold(): void {
    const graphics = this.add.graphics().setDepth(8)
    const centreX = WORLD_WIDTH / 2

    graphics.fillStyle(0x2c2c2a)
    graphics.fillRect(centreX - 185, WORLD_HEIGHT - 22, 370, 22)

    graphics.fillStyle(0xc99712)
    graphics.fillRoundedRect(
      centreX - 185,
      WORLD_HEIGHT - 25,
      370,
      16,
      7
    )
  }

  private createFurniture(): void {
    this.add
      .image(WORLD_WIDTH / 2, 282, 'couch')
      .setDisplaySize(525, 155)
      .setDepth(282)

    this.addTable(155, 405)
    this.addTable(525, 405)
    this.addTable(340, 570)
    this.addTable(965, 585)

    const plant = this.add
      .image(1135, 285, 'plant')
      .setDisplaySize(155, 180)
      .setDepth(285)

    this.effects.addPlantSway(plant)

    this.addObstacle(640, 295, 510, 78)
    this.addObstacle(155, 420, 150, 82)
    this.addObstacle(525, 420, 150, 82)
    this.addObstacle(340, 585, 150, 82)
    this.addObstacle(965, 585, 150, 82)
    this.addObstacle(1135, 300, 115, 95)
  }

  private addTable(x: number, y: number): void {
    this.add
      .image(x, y, 'round-table')
      .setDisplaySize(210, 185)
      .setDepth(y)
  }

  private addObstacle(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const zone = this.add.zone(x, y, width, height)

    this.physics.add.existing(zone, true)
    this.obstacleZones.push(zone)
  }

  private createPlayer(): void {
    this.player = this.physics.add
      .image(WORLD_WIDTH / 2, FLOOR_BOTTOM - 65, 'player')
      .setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT)
      .setCollideWorldBounds(true)
      .setVisible(false)

    const body = this.player.body as Phaser.Physics.Arcade.Body

    body.setSize(this.player.width * 0.42, this.player.height * 0.22)
    body.setOffset(this.player.width * 0.29, this.player.height * 0.74)

    this.player.setDepth(this.player.y)
  }

  private createCharacters(): void {
    this.manager = this.physics.add
      .image(760, 430, 'manager')
      .setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT)
      .setImmovable(true)

    const managerBody = this.manager.body as Phaser.Physics.Arcade.Body

    managerBody.setSize(this.manager.width * 0.44, this.manager.height * 0.2)
    managerBody.setOffset(
      this.manager.width * 0.28,
      this.manager.height * 0.76
    )

    this.manager.setDepth(this.manager.y)

    this.goodClient = this.physics.add
      .staticImage(270, 470, 'good-client')
      .setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT)
      .setDepth(470)
      .refreshBody()

    this.badClient = this.physics.add
      .staticImage(1050, 470, 'bad-client')
      .setDisplaySize(CHARACTER_WIDTH, CHARACTER_HEIGHT)
      .setDepth(470)
      .refreshBody()

    this.effects.addIdleBreathing(this.goodClient, 500)
    this.effects.addIdleBreathing(this.badClient, 900)

    /*
     * Clients are still visual placeholders only.
     * There is no client dialogue or E interaction here.
     */
    this.addObstacle(270, 545, 55, 35)
    this.addObstacle(1050, 545, 55, 35)
  }

  private createCollisions(): void {
    for (const obstacle of this.obstacleZones) {
      this.physics.add.collider(this.player, obstacle)
    }

    this.physics.add.collider(this.player, this.manager)
  }

  private createInterface(): void {
    this.homeButton = this.createHomeButton()
    this.notebookButton = this.createNotebookButton()

    this.homeButton.setVisible(false)
    this.notebookButton.setVisible(false)
  }

  private createHomeButton(): Phaser.GameObjects.Container {
    const container = this.add
      .container(44, WORLD_HEIGHT - 45)
      .setScrollFactor(0)
      .setDepth(5000)

    const hitArea = this.add
      .circle(0, 0, 31, 0x5b8c4a)
      .setStrokeStyle(3, 0x2c2c2a)
      .setInteractive({
        useHandCursor: true,
      })

    this.effects.addButtonHover(hitArea)

    const house = this.add.graphics()

    house.lineStyle(4, 0x1d2b1a)
    house.strokeTriangle(-15, -3, 0, -17, 15, -3)
    house.strokeRect(-12, -3, 24, 21)
    house.strokeRect(-4, 7, 8, 11)

    hitArea.on('pointerdown', () => {
      this.effects.pressButton(hitArea)
      this.openHomeMenu()
    })

    container.add([hitArea, house])

    return container
  }

  private createNotebookButton(): Phaser.GameObjects.Container {
    const container = this.add
      .container(112, WORLD_HEIGHT - 45)
      .setScrollFactor(0)
      .setDepth(5000)

    const hitArea = this.add
      .circle(0, 0, 31, 0x2c2c2a)
      .setStrokeStyle(3, 0x000000)
      .setInteractive({
        useHandCursor: true,
      })

    this.effects.addButtonHover(hitArea)

    const paper = this.add
      .rectangle(0, 0, 24, 31, 0xf7fafc)
      .setStrokeStyle(2, 0x2c2c2a)

    const lines = this.add.graphics()

    lines.lineStyle(1, 0x777777)

    for (let y = -10; y <= 10; y += 5) {
      lines.lineBetween(-8, y, 8, y)
    }

    hitArea.on('pointerdown', () => {
      this.effects.pressButton(hitArea)
      this.openNotebook()
    })

    container.add([hitArea, paper, lines])

    return container
  }

  private startArrivalSequence(): void {
    this.controlsEnabled = false
    this.interfaceOpen = true

    this.time.delayedCall(4550, () => {
      this.player.setVisible(true)

      this.effects.playArrivalReveal(WORLD_WIDTH, WORLD_HEIGHT)

      this.tweens.add({
        targets: this.player,
        y: 590,
        duration: 1900,
        ease: 'Sine.easeInOut',

        onComplete: () => {
          this.managerApproachesPlayer()
        },
      })
    })
  }

  private managerApproachesPlayer(): void {
    this.tweens.add({
      targets: this.manager,
      x: this.player.x + 125,
      y: this.player.y - 85,
      duration: 1600,
      ease: 'Sine.easeInOut',

      onComplete: () => {
        this.homeButton.setVisible(true)
        this.notebookButton.setVisible(true)

        /*
         * TEST MANAGER DIALOGUE 1.
         */
        this.showManagerPanel({
          message: 'Welcome! This is temporary manager test dialogue.',

          onContinue: () => {
            this.managerLeadsPlayer()
          },
        })
      },
    })
  }

  private managerLeadsPlayer(): void {
    this.interfaceOpen = true

    this.tweens.add({
      targets: this.manager,
      x: 760,
      y: 430,
      duration: 1900,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.player,
      x: 640,
      y: 515,
      duration: 1900,
      ease: 'Sine.easeInOut',

      onComplete: () => {
        /*
         * TEST MANAGER DIALOGUE 2.
         */
        this.showManagerPanel({
          message:
            'Hi again! You can now explore the room using WASD or the arrow keys.',

          onContinue: () => {
            this.interfaceOpen = false
            this.controlsEnabled = true
          },
        })
      },
    })
  }

  private zoomToManager(): void {
    this.cameras.main.pan(
      this.manager.x + 155,
      this.manager.y,
      650,
      'Sine.easeInOut'
    )

    this.cameras.main.zoomTo(1.75, 650, 'Sine.easeInOut')

    this.effects.showDialogueVignette(
      WORLD_WIDTH,
      WORLD_HEIGHT,
      this.cameras.main
    )
  }

  private restoreRoomCamera(onComplete: () => void): void {
    this.effects.hideDialogueVignette()

    this.cameras.main.pan(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      500,
      'Sine.easeInOut'
    )

    this.cameras.main.zoomTo(1, 500, 'Sine.easeInOut')

    this.time.delayedCall(520, onComplete)
  }

  private showManagerPanel({
    message,
    onContinue,
  }: ManagerDialogueStep): void {
    this.closeManagerPanel()

    this.interfaceOpen = true
    this.controlsEnabled = false

    this.zoomToManager()

    const panelWidth = 470
    const panelLeft = WORLD_WIDTH - panelWidth - 12
    const panelX = panelLeft + panelWidth / 2

    const panel = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(6000)

    const panelBody = this.add
      .rectangle(
        panelX,
        WORLD_HEIGHT / 2,
        panelWidth,
        WORLD_HEIGHT - 28,
        0xf4f7f9
      )
      .setStrokeStyle(4, 0x111111)

    const header = this.add
      .rectangle(panelX, 66, panelWidth, 90, 0xb98900)
      .setStrokeStyle(4, 0x111111)

    const title = this.add
      .text(panelX, 66, 'Your Manager', {
        color: '#111111',
        fontFamily: 'Arial',
        fontSize: '26px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const managerAvatarBorder = this.add.circle(
      panelLeft + 52,
      160,
      31,
      0x2c2c2a
    )

    const managerAvatar = this.add
      .image(panelLeft + 52, 162, 'manager')
      .setDisplaySize(47, 68)

    const managerBubble = this.add
      .rectangle(panelLeft + 270, 185, 330, 125, 0xf4f7f9)
      .setStrokeStyle(2, 0xa1a7ad)

    const managerText = this.add.text(
      managerBubble.x - 145,
      managerBubble.y - 48,
      message,
      {
        color: '#2c2c2a',
        fontFamily: 'Arial',
        fontSize: '17px',
        lineSpacing: 6,
        wordWrap: {
          width: 290,
        },
      }
    )

    const playerAvatarBorder = this.add
      .circle(panelLeft + panelWidth - 52, 385, 31, 0x2c2c2a)
      .setVisible(false)

    const playerAvatar = this.add
      .image(panelLeft + panelWidth - 52, 387, 'player')
      .setDisplaySize(47, 68)
      .setVisible(false)

    const playerBubble = this.add
      .rectangle(panelLeft + 190, 385, 260, 95, 0xe8f0e5)
      .setStrokeStyle(2, 0x7e9975)
      .setVisible(false)

    const playerReplyText = this.add
      .text(playerBubble.x - 110, playerBubble.y - 33, '', {
        color: '#2c2c2a',
        fontFamily: 'Arial',
        fontSize: '16px',
        wordWrap: {
          width: 220,
        },
      })
      .setVisible(false)

    const secondManagerAvatarBorder = this.add
      .circle(panelLeft + 52, 500, 31, 0x2c2c2a)
      .setVisible(false)

    const secondManagerAvatar = this.add
      .image(panelLeft + 52, 502, 'manager')
      .setDisplaySize(47, 68)
      .setVisible(false)

    const secondManagerBubble = this.add
      .rectangle(panelLeft + 270, 500, 330, 85, 0xf4f7f9)
      .setStrokeStyle(2, 0xa1a7ad)
      .setVisible(false)

    const secondManagerText = this.add
      .text(
        secondManagerBubble.x - 145,
        secondManagerBubble.y - 28,
        'Thanks! Your test reply was received.',
        {
          color: '#2c2c2a',
          fontFamily: 'Arial',
          fontSize: '16px',
          wordWrap: {
            width: 290,
          },
        }
      )
      .setVisible(false)

    const replyInput = this.add
      .dom(panelLeft + 205, WORLD_HEIGHT - 78)
      .createFromHTML(
        `
          <input
            name="managerTestReply"
            maxlength="120"
            aria-label="Reply to manager"
            placeholder="Type a test reply..."
            style="
              width: 310px;
              height: 54px;
              box-sizing: border-box;
              border: 2px solid #d8c59e;
              border-radius: 10px;
              padding: 0 14px;
              background: #ffffff;
              color: #2c2c2a;
              font-family: Arial, sans-serif;
              font-size: 16px;
              outline: none;
            "
          />
        `
      )
      .setScrollFactor(0)
      .setDepth(6100)

    const inputElement = replyInput.getChildByName(
      'managerTestReply'
    ) as HTMLInputElement | null

    const sendX = panelLeft + panelWidth - 47
    const sendY = WORLD_HEIGHT - 78

    const sendBackground = this.add
      .circle(sendX, sendY, 28, 0xe6e8e9)
      .setStrokeStyle(4, 0x111111)
      .setInteractive({
        useHandCursor: true,
      })

    const sendTriangle = this.add.graphics()

    sendTriangle.fillStyle(0x2c2c2a)

    sendTriangle.fillTriangle(
      sendX - 7,
      sendY - 11,
      sendX - 7,
      sendY + 11,
      sendX + 11,
      sendY
    )

    let replyHasBeenSent = false

    const sendOrContinue = () => {
      this.effects.pressButton(sendBackground)

      const reply = inputElement?.value.trim() ?? ''

      if (!replyHasBeenSent) {
        if (!reply) {
          inputElement?.focus()
          return
        }

        replyHasBeenSent = true

        playerReplyText.setText(reply).setVisible(true)

        playerAvatarBorder.setVisible(true)
        playerAvatar.setVisible(true)
        playerBubble.setVisible(true)

        secondManagerAvatarBorder.setVisible(true)
        secondManagerAvatar.setVisible(true)
        secondManagerBubble.setVisible(true)
        secondManagerText.setVisible(true)

        this.effects.animateBubble([
          playerAvatarBorder,
          playerAvatar,
          playerBubble,
          playerReplyText,
        ])

        this.effects.animateBubble(
          [
            secondManagerAvatarBorder,
            secondManagerAvatar,
            secondManagerBubble,
            secondManagerText,
          ],
          300
        )

        if (inputElement) {
          inputElement.value = ''
          inputElement.placeholder =
            'Click the triangle again to continue'
          inputElement.disabled = true
        }

        return
      }

      replyInput.destroy()
      panel.destroy(true)

      this.managerPanel = undefined
      this.managerReplyInput = undefined

      this.restoreRoomCamera(onContinue)
    }

    sendBackground.on('pointerdown', sendOrContinue)

    inputElement?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        sendOrContinue()
      }
    })

    panel.add([
      panelBody,
      header,
      title,
      managerAvatarBorder,
      managerAvatar,
      managerBubble,
      managerText,
      playerAvatarBorder,
      playerAvatar,
      playerBubble,
      playerReplyText,
      secondManagerAvatarBorder,
      secondManagerAvatar,
      secondManagerBubble,
      secondManagerText,
      sendBackground,
      sendTriangle,
    ])

    this.cameras.main.ignore([panel, replyInput])

    this.managerPanel = panel
    this.managerReplyInput = replyInput

    this.effects.animatePanel(panel)

    this.effects.animateBubble(
      [managerAvatarBorder, managerAvatar, managerBubble, managerText],
      250
    )

    this.effects.typeMessage(managerText, message, 450)

    this.effects.addButtonHover(sendBackground)
  }

  private closeManagerPanel(): void {
    this.managerReplyInput?.destroy()
    this.managerReplyInput = undefined

    this.managerPanel?.destroy(true)
    this.managerPanel = undefined
  }

  private updateMovement(): void {
    let velocityX = 0
    let velocityY = 0

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -PLAYER_SPEED
    }

    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = PLAYER_SPEED
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -PLAYER_SPEED
    }

    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = PLAYER_SPEED
    }

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.7071
      velocityY *= 0.7071
    }

    this.player.setVelocity(velocityX, velocityY)

    this.effects.updateWalking(
      this.player,
      velocityX !== 0 || velocityY !== 0,
      this.time.now
    )
  }

  private updateCharacterDepths(): void {
    this.player.setDepth(this.player.y)
    this.manager.setDepth(this.manager.y)
  }

  private openHomeMenu(): void {
    if (this.menuPanel) {
      return
    }

    const previousInterfaceState = this.interfaceOpen
    const previousControlState = this.controlsEnabled

    this.interfaceOpen = true
    this.controlsEnabled = false

    const menu = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(7000)

    const dimmer = this.add
      .rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0xefe1c7, 0.76)
      .setOrigin(0)
      .setInteractive()

    const panel = this.add
      .rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        720,
        220,
        0xf3f6f8
      )
      .setStrokeStyle(4, 0x111111)

    const topStrip = this.add
      .rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2 - 98,
        720,
        18,
        0xb98900
      )
      .setStrokeStyle(3, 0x111111)

    const resume = this.createMenuButton(
      WORLD_WIDTH / 2 - 215,
      WORLD_HEIGHT / 2 + 15,
      'Resume',
      () => {
        menu.destroy(true)
        this.menuPanel = undefined
        this.interfaceOpen = previousInterfaceState
        this.controlsEnabled = previousControlState
      }
    )

    const restart = this.createMenuButton(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2 + 15,
      'Restart',
      () => {
        window.location.reload()
      }
    )

    const quit = this.createMenuButton(
      WORLD_WIDTH / 2 + 215,
      WORLD_HEIGHT / 2 + 15,
      'Quit',
      () => {
        window.location.assign('/dashboard')
      }
    )

    menu.add([dimmer, panel, topStrip, resume, restart, quit])

    this.cameras.main.ignore(menu)
    this.menuPanel = menu
  }

  private createMenuButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    const background = this.add
      .rectangle(0, 0, 160, 50, 0x5b8c4a)
      .setStrokeStyle(3, 0x111111)
      .setInteractive({
        useHandCursor: true,
      })

    this.effects.addButtonHover(background)

    const text = this.add
      .text(0, 0, label, {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontSize: '21px',
      })
      .setOrigin(0.5)

    background.on('pointerdown', () => {
      this.effects.pressButton(background)
      onClick()
    })

    container.add([background, text])

    return container
  }

  private openNotebook(): void {
    if (this.notebookPanel) {
      return
    }

    const previousInterfaceState = this.interfaceOpen
    const previousControlState = this.controlsEnabled

    this.interfaceOpen = true
    this.controlsEnabled = false

    const panel = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(7200)

    const dimmer = this.add
      .rectangle(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        0xefe1c7,
        0.82
      )
      .setOrigin(0)
      .setInteractive()

    const notebookWidth = 460
    const notebookHeight = 625
    const notebookX = WORLD_WIDTH / 2
    const notebookY = WORLD_HEIGHT / 2

    const notebookBody = this.add
      .rectangle(
        notebookX,
        notebookY,
        notebookWidth,
        notebookHeight,
        0xf4f7f9
      )
      .setStrokeStyle(5, 0x111111)

    const header = this.add
      .rectangle(notebookX, 94, notebookWidth, 105, 0xb98900)
      .setStrokeStyle(5, 0x111111)

    const iconCircle = this.add
      .circle(notebookX, 94, 42, 0x2c2c2a)
      .setStrokeStyle(4, 0x000000)

    const iconPaper = this.add
      .rectangle(notebookX, 94, 27, 38, 0xf4f7f9)
      .setStrokeStyle(2, 0x111111)

    const iconLines = this.add.graphics()

    iconLines.lineStyle(1, 0x555555)

    for (let y = 82; y <= 106; y += 5) {
      iconLines.lineBetween(notebookX - 9, y, notebookX + 9, y)
    }

    const input = this.add
      .dom(notebookX, notebookY + 62)
      .createFromHTML(
        `
          <textarea
            name="levelOneNotes"
            maxlength="1000"
            aria-label="Level 1 consultant notes"
            style="
              width: 365px;
              height: 430px;
              resize: none;
              border: 0;
              padding: 4px 8px;
              background-color: #f4f7f9;
              background-image:
                repeating-linear-gradient(
                  to bottom,
                  transparent 0,
                  transparent 34px,
                  #222222 35px,
                  #222222 37px
                );
              color: #2c2c2a;
              font-family: Arial, sans-serif;
              font-size: 17px;
              line-height: 37px;
              outline: none;
              overflow-y: auto;
            "
          ></textarea>
        `
      )
      .setScrollFactor(0)
      .setDepth(7300)

    const textarea = input.getChildByName(
      'levelOneNotes'
    ) as HTMLTextAreaElement | null

    if (textarea) {
      textarea.value = this.notes
    }

    const saveX = notebookX + notebookWidth / 2 - 25
    const saveY = notebookY + notebookHeight / 2 + 28

    const saveButton = this.add
      .circle(saveX, saveY, 25, 0xe6e8e9)
      .setStrokeStyle(4, 0x111111)
      .setInteractive({
        useHandCursor: true,
      })

    this.effects.addButtonHover(saveButton)

    const saveTriangle = this.add.graphics()

    saveTriangle.fillStyle(0x2c2c2a)

    saveTriangle.fillTriangle(
      saveX - 7,
      saveY - 11,
      saveX - 7,
      saveY + 11,
      saveX + 11,
      saveY
    )

    const saveNotebook = () => {
      if (textarea) {
        this.notes = textarea.value
      }

      input.destroy()
      panel.destroy(true)

      this.notebookPanel = undefined
      this.notebookInput = undefined

      this.interfaceOpen = previousInterfaceState
      this.controlsEnabled = previousControlState
    }

    saveButton.on('pointerdown', () => {
      this.effects.pressButton(saveButton)
      this.effects.playSaveSparkles(saveX, saveY, saveNotebook)
    })

    panel.add([
      dimmer,
      notebookBody,
      header,
      iconCircle,
      iconPaper,
      iconLines,
      saveButton,
      saveTriangle,
    ])

    this.cameras.main.ignore([panel, input])

    this.notebookPanel = panel
    this.notebookInput = input

    this.effects.animateNotebook(panel)
  }
}

export default LevelOneScene