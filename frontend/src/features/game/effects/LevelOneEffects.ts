import Phaser from 'phaser'

type BubbleObject =
  | Phaser.GameObjects.Text
  | Phaser.GameObjects.Image
  | Phaser.GameObjects.Rectangle
  | Phaser.GameObjects.Arc

export class LevelOneEffects {
  private readonly scene: Phaser.Scene

  private readonly shadows = new Map<Phaser.Physics.Arcade.Image, Phaser.GameObjects.Ellipse>()

  private vignette?: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    /*
     * Keep character shadows attached to their characters.
     */
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.updateShadows, this)

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.updateShadows, this)
    })
  }

  /*
   * Adds a small animated floor shadow beneath a character.
   */
  addCharacterShadow(character: Phaser.Physics.Arcade.Image, width = 72): void {
    const shadow = this.scene.add
      .ellipse(character.x, character.y + character.displayHeight * 0.43, width, 18, 0x2c2c2a, 0.2)
      .setDepth(character.y - 2)

    this.shadows.set(character, shadow)
  }

  /*
   * Called from the scene's movement method.
   * Adds a walking tilt, bounce and responsive shadow.
   */
  updateWalking(character: Phaser.Physics.Arcade.Image, moving: boolean, time: number): void {
    const shadow = this.shadows.get(character)

    if (!moving) {
      character.setAngle(0)

      shadow?.setScale(1, 1)
      shadow?.setAlpha(0.2)

      return
    }

    const walkingCycle = Math.sin(time / 75)

    character.setAngle(walkingCycle * 2.8)

    shadow?.setScale(1 - Math.abs(walkingCycle) * 0.08, 1 - Math.abs(walkingCycle) * 0.12)

    shadow?.setAlpha(0.16 + Math.abs(walkingCycle) * 0.06)
  }

  /*
   * Gentle breathing animation for stationary NPCs.
   * Only scale is animated, so physics positions are unchanged.
   */
  addIdleBreathing(
    character: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Image,
    delay = 0
  ): void {
    const normalScaleY = character.scaleY

    this.scene.tweens.add({
      targets: character,
      scaleY: normalScaleY * 1.018,
      duration: 1500,
      delay,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /*
   * Very subtle plant movement.
   */
  addPlantSway(plant: Phaser.GameObjects.Image): void {
    this.scene.tweens.add({
      targets: plant,
      angle: {
        from: -0.8,
        to: 0.8,
      },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /*
   * Soft daylight variation over the two windows.
   */
  addWindowAmbience(leftWindowX: number, rightWindowX: number, windowY: number): void {
    const overlays = [
      this.scene.add.rectangle(leftWindowX, windowY, 292, 140, 0xffffff, 0.03).setDepth(2.5),

      this.scene.add.rectangle(rightWindowX, windowY, 292, 140, 0xffffff, 0.03).setDepth(2.5),
    ]

    this.scene.tweens.add({
      targets: overlays,
      alpha: {
        from: 0.025,
        to: 0.1,
      },
      duration: 3800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /*
   * Gold light sweep across the elevator threshold.
   */
  playElevatorSweep(centreX: number, worldHeight: number): void {
    const glow = this.scene.add
      .rectangle(centreX - 150, worldHeight - 24, 55, 13, 0xffe28a, 0)
      .setDepth(12)

    this.scene.tweens.add({
      targets: glow,
      x: centreX + 150,
      alpha: {
        from: 0,
        to: 0.9,
      },
      duration: 750,
      delay: 4400,
      ease: 'Sine.easeInOut',

      onComplete: () => {
        this.scene.tweens.add({
          targets: glow,
          alpha: 0,
          duration: 250,

          onComplete: () => {
            glow.destroy()
          },
        })
      },
    })
  }

  /*
   * Brief reveal when the character enters the room.
   */
  playArrivalReveal(width: number, height: number): void {
    const overlay = this.scene.add
      .rectangle(0, 0, width, height, 0x2c2c2a, 0.28)
      .setOrigin(0)
      .setDepth(4000)

    this.scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',

      onComplete: () => {
        overlay.destroy()
      },
    })
  }

  /*
   * Slides and fades a fixed UI panel into view.
   */
  animatePanel(panel: Phaser.GameObjects.Container): void {
    const finalX = panel.x

    panel.setX(finalX + 28).setAlpha(0)

    this.scene.tweens.add({
      targets: panel,
      x: finalX,
      alpha: 1,
      duration: 330,
      ease: 'Back.easeOut',
    })
  }

  /*
   * Makes dialogue elements appear sequentially.
   */
  animateBubble(objects: BubbleObject[], delay = 0): void {
    for (const object of objects) {
      const finalX = object.x

      object.setX(finalX + 14).setAlpha(0)

      this.scene.tweens.add({
        targets: object,
        x: finalX,
        alpha: 1,
        duration: 280,
        delay,
        ease: 'Sine.easeOut',
      })
    }
  }

  /*
   * Reveals dialogue text one character at a time.
   */
  typeMessage(textObject: Phaser.GameObjects.Text, message: string, delay = 350): void {
    textObject.setText('')

    this.scene.time.delayedCall(delay, () => {
      let characterIndex = 0

      const timer = this.scene.time.addEvent({
        delay: 22,
        loop: true,

        callback: () => {
          characterIndex += 1

          textObject.setText(message.slice(0, characterIndex))

          if (characterIndex >= message.length) {
            timer.remove()
          }
        },
      })
    })
  }

  /*
   * Standard button hover animation.
   */
  addButtonHover(button: Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle): void {
    button.on('pointerover', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1.06,
        duration: 120,
        ease: 'Sine.easeOut',
      })
    })

    button.on('pointerout', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 120,
        ease: 'Sine.easeOut',
      })
    })
  }

  /*
   * Button compression when clicked.
   */
  pressButton(button: Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle): void {
    this.scene.tweens.add({
      targets: button,
      scale: 0.88,
      duration: 75,
      yoyo: true,
      ease: 'Sine.easeOut',
    })
  }

  /*
   * Adds a dark cinematic edge while speaking to the manager.
   */
  showDialogueVignette(
    worldWidth: number,
    worldHeight: number,
    mainCamera: Phaser.Cameras.Scene2D.Camera
  ): void {
    this.hideDialogueVignette()

    const vignette = this.scene.add.container(0, 0).setDepth(5400).setAlpha(0)

    const top = this.scene.add.rectangle(worldWidth / 2, 24, worldWidth, 48, 0x000000, 0.32)

    const bottom = this.scene.add.rectangle(
      worldWidth / 2,
      worldHeight - 24,
      worldWidth,
      48,
      0x000000,
      0.32
    )

    const left = this.scene.add.rectangle(22, worldHeight / 2, 44, worldHeight, 0x000000, 0.22)

    const right = this.scene.add.rectangle(
      worldWidth - 22,
      worldHeight / 2,
      44,
      worldHeight,
      0x000000,
      0.22
    )

    vignette.add([top, bottom, left, right])

    /*
     * The main camera renders the room, not this interface effect.
     */
    mainCamera.ignore(vignette)

    this.scene.tweens.add({
      targets: vignette,
      alpha: 1,
      duration: 350,
      ease: 'Sine.easeOut',
    })

    this.vignette = vignette
  }

  hideDialogueVignette(): void {
    if (!this.vignette) {
      return
    }

    const currentVignette = this.vignette

    this.vignette = undefined

    this.scene.tweens.add({
      targets: currentVignette,
      alpha: 0,
      duration: 280,

      onComplete: () => {
        currentVignette.destroy(true)
      },
    })
  }

  /*
   * Makes the notebook fade and move slightly upward.
   */
  animateNotebook(panel: Phaser.GameObjects.Container): void {
    panel.setY(24).setAlpha(0)

    this.scene.tweens.add({
      targets: panel,
      y: 0,
      alpha: 1,
      duration: 320,
      ease: 'Back.easeOut',
    })
  }

  /*
   * Small gold sparkle animation after saving notes.
   */
  playSaveSparkles(centreX: number, centreY: number, onComplete: () => void): void {
    const sparkles: Phaser.GameObjects.Arc[] = []

    for (let index = 0; index < 7; index += 1) {
      const angle = (Math.PI * 2 * index) / 7

      const sparkle = this.scene.add
        .circle(centreX, centreY, 4, index % 2 === 0 ? 0xffd65a : 0xffffff)
        .setDepth(7500)

      sparkles.push(sparkle)

      this.scene.tweens.add({
        targets: sparkle,

        x: centreX + Math.cos(angle) * 55,

        y: centreY + Math.sin(angle) * 55,

        alpha: 0,
        scale: 0.3,

        duration: 420,
        ease: 'Sine.easeOut',

        onComplete: () => {
          sparkle.destroy()
        },
      })
    }

    this.scene.time.delayedCall(440, onComplete)
  }

  private updateShadows(): void {
    for (const [character, shadow] of this.shadows) {
      if (!character.active) {
        shadow.destroy()
        this.shadows.delete(character)
        continue
      }

      shadow
        .setPosition(character.x, character.y + character.displayHeight * 0.43)
        .setVisible(character.visible)
        .setDepth(character.y - 2)
    }
  }
}
