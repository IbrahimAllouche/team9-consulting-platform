import Phaser from 'phaser'
import { LevelOneEffects } from '../effects/LevelOneEffects'
import { requestPersonaReply } from './personaDialogue'

export type ClientDefinition = {
  name: string
  texture: string
  personaId: string
  sprite: Phaser.GameObjects.Image
}

type ClientDialogueControllerOptions = {
  scene: Phaser.Scene
  player: Phaser.Physics.Arcade.Image
  clients: ClientDefinition[]
  effects: LevelOneEffects
  mainCamera: Phaser.Cameras.Scene2D.Camera
  interfaceCamera: Phaser.Cameras.Scene2D.Camera
  worldWidth: number
  worldHeight: number
  onOpen: () => void
  onClose: () => void
}

const INTERACTION_DISTANCE = 185

export class ClientDialogueController {
  private readonly scene: Phaser.Scene
  private readonly player: Phaser.Physics.Arcade.Image
  private readonly clients: ClientDefinition[]
  private readonly effects: LevelOneEffects

  private readonly mainCamera: Phaser.Cameras.Scene2D.Camera
  private readonly interfaceCamera: Phaser.Cameras.Scene2D.Camera

  private readonly worldWidth: number
  private readonly worldHeight: number

  private readonly onOpen: () => void
  private readonly onClose: () => void

  private readonly interactionKey: Phaser.Input.Keyboard.Key

  private readonly proximityPrompt: Phaser.GameObjects.Container

  private activeClient?: ClientDefinition
  private panel?: Phaser.GameObjects.Container
  private replyInput?: Phaser.GameObjects.DOMElement

  constructor({
    scene,
    player,
    clients,
    effects,
    mainCamera,
    interfaceCamera,
    worldWidth,
    worldHeight,
    onOpen,
    onClose,
  }: ClientDialogueControllerOptions) {
    this.scene = scene
    this.player = player
    this.clients = clients
    this.effects = effects

    this.mainCamera = mainCamera
    this.interfaceCamera = interfaceCamera

    this.worldWidth = worldWidth
    this.worldHeight = worldHeight

    this.onOpen = onOpen
    this.onClose = onClose

    const keyboard = this.scene.input.keyboard

    if (!keyboard) {
      throw new Error('Keyboard input is unavailable for client interaction.')
    }

    this.interactionKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

    this.proximityPrompt = this.createProximityPrompt()

    /*
     * The prompt belongs to the room, not the fixed UI camera.
     */
    this.interfaceCamera.ignore(this.proximityPrompt)
  }

  update(): void {
    if (this.panel || this.replyInput) {
      this.hidePrompt()
      return
    }

    const closestClient = this.findClosestClient()

    if (!closestClient) {
      this.activeClient = undefined
      this.hidePrompt()
      return
    }

    this.activeClient = closestClient

    this.proximityPrompt
      .setPosition(closestClient.sprite.x, closestClient.sprite.y - 125)
      .setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.openDialogue(closestClient)
    }
  }

  hidePrompt(): void {
    this.proximityPrompt.setVisible(false)
  }

  destroy(): void {
    this.replyInput?.destroy()
    this.panel?.destroy(true)
    this.proximityPrompt.destroy(true)

    this.replyInput = undefined
    this.panel = undefined
    this.activeClient = undefined
  }

  private findClosestClient(): ClientDefinition | undefined {
    let closestClient: ClientDefinition | undefined

    let closestDistance = INTERACTION_DISTANCE

    for (const client of this.clients) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        client.sprite.x,
        client.sprite.y
      )

      if (distance <= closestDistance) {
        closestClient = client
        closestDistance = distance
      }
    }

    return closestClient
  }

  private createProximityPrompt(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0).setDepth(5200).setVisible(false)

    const background = this.scene.add
      .rectangle(0, 0, 175, 45, 0x5b8c4a, 0.96)
      .setStrokeStyle(3, 0x111111)

    const keyboardKey = this.scene.add
      .rectangle(-62, 0, 29, 29, 0xf4f7f9)
      .setStrokeStyle(2, 0x111111)

    const keyText = this.scene.add
      .text(-62, 0, 'E', {
        color: '#111111',
        fontFamily: 'Arial',
        fontSize: '17px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const promptText = this.scene.add
      .text(18, 0, 'Talk', {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    container.add([background, keyboardKey, keyText, promptText])

    return container
  }

  private openDialogue(client: ClientDefinition): void {
    if (this.panel) {
      return
    }

    this.hidePrompt()
    this.onOpen()

    this.player.setVelocity(0)

    /*
     * Close-up framing based on the supplied mock.
     * The client remains large on the left while the
     * fixed dialogue panel stays on the right.
     */
    this.mainCamera.pan(client.sprite.x + 175, client.sprite.y, 600, 'Sine.easeInOut')

    this.mainCamera.zoomTo(2.05, 600, 'Sine.easeInOut')

    this.effects.showDialogueVignette(this.worldWidth, this.worldHeight, this.mainCamera)

    this.createDialoguePanel(client)
  }

  private createDialoguePanel(client: ClientDefinition): void {
    const panelWidth = 470
    const panelLeft = this.worldWidth - panelWidth - 12

    const panelX = panelLeft + panelWidth / 2

    const panel = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(6500)

    const panelBody = this.scene.add
      .rectangle(panelX, this.worldHeight / 2, panelWidth, this.worldHeight - 28, 0xf4f7f9)
      .setStrokeStyle(4, 0x111111)

    const header = this.scene.add
      .rectangle(panelX, 66, panelWidth, 90, 0xb98900)
      .setStrokeStyle(4, 0x111111)

    const title = this.scene.add
      .text(panelX, 66, client.name, {
        color: '#111111',
        fontFamily: 'Arial',
        fontSize: '27px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    /*
     * Initial temporary client message.
     */
    const clientAvatarBorder = this.scene.add.circle(panelLeft + 52, 160, 31, 0x2c2c2a)

    const clientAvatar = this.scene.add
      .image(panelLeft + 52, 162, client.texture)
      .setDisplaySize(47, 68)

    const clientBubble = this.scene.add
      .rectangle(panelLeft + 270, 175, 330, 100, 0xf4f7f9)
      .setStrokeStyle(2, 0xa1a7ad)

    const clientText = this.scene.add.text(clientBubble.x - 145, clientBubble.y - 18, 'Hi!', {
      color: '#2c2c2a',
      fontFamily: 'Arial',
      fontSize: '18px',
      wordWrap: {
        width: 290,
      },
    })

    /*
     * User reply elements start hidden.
     */
    const playerAvatarBorder = this.scene.add
      .circle(panelLeft + panelWidth - 52, 345, 31, 0x2c2c2a)
      .setVisible(false)

    const playerAvatar = this.scene.add
      .image(panelLeft + panelWidth - 52, 347, 'player')
      .setDisplaySize(47, 68)
      .setVisible(false)

    const playerBubble = this.scene.add
      .rectangle(panelLeft + 190, 345, 260, 90, 0xe8f0e5)
      .setStrokeStyle(2, 0x7e9975)
      .setVisible(false)

    const playerText = this.scene.add
      .text(playerBubble.x - 110, playerBubble.y - 30, '', {
        color: '#2c2c2a',
        fontFamily: 'Arial',
        fontSize: '16px',
        wordWrap: {
          width: 220,
        },
      })
      .setVisible(false)

    /*
     * Final temporary client response.
     */
    const finalClientAvatarBorder = this.scene.add
      .circle(panelLeft + 52, 475, 31, 0x2c2c2a)
      .setVisible(false)

    const finalClientAvatar = this.scene.add
      .image(panelLeft + 52, 477, client.texture)
      .setDisplaySize(47, 68)
      .setVisible(false)

    const finalClientBubble = this.scene.add
      .rectangle(panelLeft + 270, 475, 330, 90, 0xf4f7f9)
      .setStrokeStyle(2, 0xa1a7ad)
      .setVisible(false)

    const finalClientText = this.scene.add
      .text(finalClientBubble.x - 145, finalClientBubble.y - 28, 'Hi, nice to meet you!', {
        color: '#2c2c2a',
        fontFamily: 'Arial',
        fontSize: '16px',
        wordWrap: {
          width: 290,
        },
      })
      .setVisible(false)

    const replyInput = this.scene.add
      .dom(panelLeft + 205, this.worldHeight - 78)
      .createFromHTML(
        `
        <input
          name="clientMockReply"
          maxlength="120"
          aria-label="Reply to ${client.name}"
          placeholder="Type a quick test reply..."
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
      .setDepth(6600)

    const inputElement = replyInput.getChildByName('clientMockReply') as HTMLInputElement | null

    const sendX = panelLeft + panelWidth - 47

    const sendY = this.worldHeight - 78

    const sendButton = this.scene.add
      .circle(sendX, sendY, 28, 0xe6e8e9)
      .setStrokeStyle(4, 0x111111)
      .setInteractive({
        useHandCursor: true,
      })

    /*
     * Keep the existing preferred triangular control.
     */
    const sendTriangle = this.scene.add.graphics()

    sendTriangle.fillStyle(0x2c2c2a)

    sendTriangle.fillTriangle(sendX - 7, sendY - 11, sendX - 7, sendY + 11, sendX + 11, sendY)

    let replySent = false
let requestInProgress = false

const sendOrClose = async () => {
  this.effects.pressButton(sendButton)

  if (!replySent) {
    const reply = inputElement?.value.trim() ?? ''

    if (!reply || requestInProgress) {
      inputElement?.focus()
      return
    }

    requestInProgress = true

    playerText.setText(reply).setVisible(true)

    playerAvatarBorder.setVisible(true)
    playerAvatar.setVisible(true)
    playerBubble.setVisible(true)

    this.effects.animateBubble([
      playerAvatarBorder,
      playerAvatar,
      playerBubble,
      playerText,
    ])

    if (inputElement) {
      inputElement.value = ''
      inputElement.disabled = true
      inputElement.placeholder = 'Waiting for client response...'
    }

    finalClientText.setText('Thinking...')

    finalClientAvatarBorder.setVisible(true)
    finalClientAvatar.setVisible(true)
    finalClientBubble.setVisible(true)
    finalClientText.setVisible(true)

    this.effects.animateBubble(
      [
        finalClientAvatarBorder,
        finalClientAvatar,
        finalClientBubble,
        finalClientText,
      ],
      300
    )

    const result = await requestPersonaReply({
      message: reply,
      personaId: client.personaId,
    })

    finalClientText.setText(result.reply)

    replySent = true
    requestInProgress = false

    if (inputElement) {
      inputElement.placeholder = 'Click the triangle again to close'
    }

    return
  }

  if (!requestInProgress) {
    this.closeDialogue()
  }
}
    sendButton.on('pointerdown', sendOrClose)

    inputElement?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        sendOrClose()
      }
    })

    panel.add([
      panelBody,
      header,
      title,
      clientAvatarBorder,
      clientAvatar,
      clientBubble,
      clientText,
      playerAvatarBorder,
      playerAvatar,
      playerBubble,
      playerText,
      finalClientAvatarBorder,
      finalClientAvatar,
      finalClientBubble,
      finalClientText,
      sendButton,
      sendTriangle,
    ])

    /*
     * Dialogue stays fixed while the room camera zooms.
     */
    this.mainCamera.ignore([panel, replyInput])

    this.panel = panel
    this.replyInput = replyInput

    this.effects.animatePanel(panel)

    this.effects.animateBubble([clientAvatarBorder, clientAvatar, clientBubble, clientText], 250)

    this.effects.typeMessage(clientText, 'Hi!', 400)

    this.effects.addButtonHover(sendButton)
  }

  private closeDialogue(): void {
    this.replyInput?.destroy()
    this.replyInput = undefined

    this.panel?.destroy(true)
    this.panel = undefined

    this.activeClient = undefined

    this.effects.hideDialogueVignette()

    this.mainCamera.pan(this.worldWidth / 2, this.worldHeight / 2, 500, 'Sine.easeInOut')

    this.mainCamera.zoomTo(1, 500, 'Sine.easeInOut')

    this.scene.time.delayedCall(520, () => {
      this.onClose()
    })
  }
}
