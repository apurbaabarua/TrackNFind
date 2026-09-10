document.addEventListener("DOMContentLoaded", function () {   
    const logo = document.querySelector(".logo");
    const intro = document.querySelector(".intro");
    const navbar = document.querySelector(".navbar");
    /*const canvas = document.querySelector('#canvas')
    const ctx = canvas.getContext('2d')*/

    

    gsap.to(logo, {
        opacity: 1,
        duration: 2,
        y: 0,
        ease: "power2.out"
    });

    gsap.to(intro, {
        delay: 3,
        opacity: 0,
        duration: 1,
        onComplete: function () {
            intro.style.display = "none";
            navbar.style.display = "flex"; // Show the navbar after animation
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
      document.querySelector(".intro").style.animation = "fadeOut 1s forwards";
      setTimeout(() => {
          document.querySelector(".intro").style.display = "none";
          document.querySelector(".main-content").style.display = "block";
      }, 1000); // Matches fadeOut duration
  }, 2000); // Delay before fading out
});

// Scroll animations for sections
document.addEventListener("scroll", () => {
    let sections = document.querySelectorAll("section");
    sections.forEach(sec => {
        let rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            sec.style.opacity = 1;
            sec.style.transform = "translateY(0)";
        }
    });
});

// Contact form alert
const form = document.querySelector("form");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thank you for reaching out! We'll get back to you soon.");
    });
}


console.clear()
console.log('lsakdfalskjdflnksd')

const config = {
  src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png' ,
  rows: 15,
  cols: 7
}

// UTILS

const randomRange = (min, max) => min + Math.random() * (max - min)

const randomIndex = (array) => randomRange(0, array.length) | 0

const removeFromArray = (array, i) => array.splice(i, 1)[0]

const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item))

const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array))

const getRandomFromArray = (array) => (
  array[randomIndex(array) | 0]
)

// TWEEN FACTORIES

const resetPeep = ({ stage, peep }) => {
  const direction = Math.random() > 0.5 ? 1 : -1
  // using an ease function to skew random to lower values to help hide that peeps have no legs
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  
  return {
    startX,
    startY,
    endX
  }
}

const normalWalk = ({ peep, props }) => {
  const {
    startX,
    startY,
    endX
  } = props

  const xDuration = 10
  const yDuration = 0.25
  
  const tl = gsap.timeline()
  tl.timeScale(randomRange(0.5, 1.5))
  tl.to(peep, {
    duration: xDuration,
    x: endX,
    ease: 'none'
  }, 0)
  tl.to(peep, {
    duration: yDuration,
    repeat: xDuration / yDuration,
    yoyo: true,
    y: startY - 10
  }, 0)
    
  return tl
}

const walks = [
  normalWalk,
]

// CLASSES

class Peep {
  constructor({
    image,
    rect,
  }) {
    this.image = image
    this.setRect(rect)
    
    this.x = 0
    this.y = 0
    this.anchorY = 0
    this.scaleX = 1
    this.walk = null
  }
  
  setRect (rect) {
    this.rect = rect
    this.width = rect[2]
    this.height = rect[3]
    
    this.drawArgs = [
      this.image,
      ...rect,
      0, 0, this.width, this.height
    ]  
  }
  
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.scaleX, 1)
    ctx.drawImage(...this.drawArgs)
    ctx.restore()
  }
}

// MAIN

const img = document.createElement('img')
img.src = config.src

let canvas
let ctx

const stage = {
  width: 0,
  height: 0,
}

const allPeeps = []
const availablePeeps = []
const crowd = []

function init () {
  canvas = document.querySelector('#canvas')
  if (!canvas) return
  ctx = canvas.getContext('2d')
  
  createPeeps()
  
  // resize also (re)populates the stage
  resize()

  gsap.ticker.add(render)
  window.addEventListener('resize', resize)
}

function startSimulator () {
  if (img.complete) {
    init()
  } else {
    img.onload = init
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSimulator)
} else {
  startSimulator()
}

function createPeeps () {
  const {
    rows,
    cols
  } = config
  const {
    naturalWidth: width,
    naturalHeight: height
  } = img
  const total = rows * cols
  const rectWidth = width / rows
  const rectHeight = height / cols
  
  for (let i = 0; i < total; i++) {
    allPeeps.push(new Peep({
      image: img,
      rect: [
        (i % rows) * rectWidth,
        (i / rows | 0) * rectHeight,
        rectWidth,
        rectHeight,
      ]
    }))
  }  
}

function resize () {
  stage.width = canvas.clientWidth
  stage.height = canvas.clientHeight
  canvas.width = stage.width * devicePixelRatio
  canvas.height = stage.height * devicePixelRatio
  
  crowd.forEach((peep) => {
    peep.walk.kill()
  })
  
  crowd.length = 0
  availablePeeps.length = 0
  availablePeeps.push(...allPeeps)
  
  initCrowd()
}

function initCrowd () {
  while (availablePeeps.length) {
    // setting random tween progress spreads the peeps out
    addPeepToCrowd().walk.progress(Math.random())
  }
}

function addPeepToCrowd () {
  const peep = removeRandomFromArray(availablePeeps)
  const walk = getRandomFromArray(walks)({
    peep,
    props: resetPeep({
      peep,
      stage,
    })
  }).eventCallback('onComplete', () => {
    removePeepFromCrowd(peep)
    addPeepToCrowd()
  })
  
  peep.walk = walk
  
  crowd.push(peep)
  crowd.sort((a, b) => a.anchorY - b.anchorY)
  
  return peep
}

function removePeepFromCrowd (peep) {
  removeItemFromArray(crowd, peep)
  availablePeeps.push(peep)
}

function render () {
  canvas.width = canvas.width
  ctx.save()
  ctx.scale(devicePixelRatio, devicePixelRatio)
  
  crowd.forEach((peep) => {
    peep.render(ctx)
  })
  
  ctx.restore()
}

const messages = [
            "Oh no! I can't find my friend!",
            "Has anyone seen my son?",
            "Where did my brother go?",
            "I lost my sister!",
            "Help! I can't find my family!",
            "So many people, so much noise, ughhh"
          
        ];

        function createSpeechBubble(x, y, message) {
            const bubble = document.createElement("div");
            bubble.classList.add("speech-bubble");
            bubble.innerText = message;
            document.body.appendChild(bubble);
            
            bubble.style.left = `${x}px`;
            bubble.style.top = `${y - 50}px`;

            gsap.to(bubble, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
            setTimeout(() => {
                gsap.to(bubble, { opacity: 0, scale: 0.8, duration: 0.5, ease: "power2.in", onComplete: () => bubble.remove() });
            }, 3000);
        }

        function randomSpeechBubble() {
            const x = Math.random() * window.innerWidth * 0.8;
            const y = Math.random() * window.innerHeight * 0.8 + 100;
            const message = messages[Math.floor(Math.random() * messages.length)];
            createSpeechBubble(x, y, message);
        }

        setInterval(randomSpeechBubble, 5000);

        function showPopup() {
            const popup = document.getElementById("popup");
            gsap.to(popup, { opacity: 1, duration: 1, ease: "power2.out" });
            setTimeout(() => {
                gsap.to(popup, { opacity: 0, duration: 1, ease: "power2.in" });
            }, 5000);
        }
        
        setTimeout(showPopup, 3000);

        document.addEventListener("DOMContentLoaded", function() {
          let surveillanceSection = document.querySelector(".smart-surveillance");
      
          function checkScroll() {
              let sectionPosition = surveillanceSection.getBoundingClientRect().top;
              let screenPosition = window.innerHeight / 1.3;
      
              if (sectionPosition < screenPosition) {
                  surveillanceSection.classList.add("visible");
              }
          }
      
          window.addEventListener("scroll", checkScroll);
      });
     
      document.addEventListener("DOMContentLoaded", function () {
        const cctvCamera = document.getElementById("cctvCamera");
        const ledLight = document.querySelector(".led-light");
    
        let isFollowing = false; // Flag to check if camera should follow mouse
    
        // Pause scanning on hover, resume on leave
        cctvCamera.addEventListener("mouseenter", function () {
            cctvCamera.style.animation = "none"; // Stop scan animation
            ledLight.style.animation = "blink 0.3s infinite alternate"; // Blink faster
            isFollowing = true; // Start mouse tracking
        });
    
        cctvCamera.addEventListener("mouseleave", function () {
            cctvCamera.style.animation = "scan 3s infinite alternate ease-in-out"; // Resume scan
            ledLight.style.animation = "blink 1s infinite alternate"; // Normal blink
            isFollowing = false; // Stop mouse tracking
        });
    
        // Camera follows mouse when hovered
        document.addEventListener("mousemove", function (e) {
            if (isFollowing) {
                let x = (e.clientX / window.innerWidth) * 20 - 10; // Map mouse X position
                cctvCamera.style.transform = `rotate(${x}deg)`;
            }
        });
    });

    
    document.addEventListener("DOMContentLoaded", function() {
      document.querySelectorAll(".step").forEach((step, index) => {
          setTimeout(() => {
              step.style.opacity = "1";
              step.style.transform = "translateY(0)";
          }, index * 300);
      });
  });

  document.addEventListener("DOMContentLoaded", function () {
    let testimonials = document.querySelectorAll(".testimonial");
    let index = 0;

    function showNextTestimonial() {
        testimonials[index].classList.remove("active");
        index = (index + 1) % testimonials.length;
        testimonials[index].classList.add("active");
    }

    setInterval(showNextTestimonial, 3000); // Change every 4 seconds
});

document.addEventListener("DOMContentLoaded", function () {
  gsap.from(".logo", { duration: 1, opacity: 0, y: -50, ease: "power2.out" });
  gsap.from(".navbar", { duration: 1, opacity: 0, y: -50, ease: "power2.out", delay: 0.5 });
  
  gsap.utils.toArray(".feature-box").forEach((box, index) => {
      gsap.from(box, {
          scrollTrigger: {
              trigger: box,
              start: "top 80%",
              toggleActions: "play none none none"
          },
          opacity: 0,
          y: 50,
          duration: 1,
          delay: index * 0.2
      });
  });
  
  gsap.to(".testimonial", {
      opacity: 1,
      x: 0,
      duration: 1,
      scrollTrigger: {
          trigger: ".testimonials",
          start: "top 85%",
          toggleActions: "play none none none"
      }
  });
});
