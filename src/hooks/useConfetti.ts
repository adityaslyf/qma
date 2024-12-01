import confetti from 'canvas-confetti'

export const useConfetti = () => {
  const triggerConfetti = () => {
    const count = 120
    const defaults = {
      origin: { y: 0.7 },
      spread: 360,
      ticks: 100,
      gravity: 0.8,
      decay: 0.96,
      startVelocity: 20,
      shapes: ['square', 'circle'],
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffd426', '#ff87ab']
    }
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        shapes: defaults.shapes as confetti.Shape[]
      })
    }

    fire(0.2, {
      spread: 20,
      startVelocity: 25,
      scalar: 0.8
    })

    setTimeout(() => {
      fire(0.3, {
        spread: 40,
        startVelocity: 30,
        scalar: 1
      })
    }, 200)

    setTimeout(() => {
      fire(0.25, {
        spread: 60,
        decay: 0.92,
        scalar: 1.2
      })
    }, 400)

    setTimeout(() => {
      fire(0.15, {
        spread: 80,
        startVelocity: 15,
        decay: 0.91,
        scalar: 1.1
      })
    }, 600)

    setTimeout(() => {
      fire(0.1, {
        spread: 100,
        startVelocity: 20,
        decay: 0.90
      })
    }, 800)
  }

  return { triggerConfetti }
} 