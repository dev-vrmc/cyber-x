gsap.registerPlugin(ScrollTrigger);

gsap.fromTo(".nav__icon",
  {
    rotatey: -100,
  }, {
  rotatey: 0,
  duration: 1,
})

gsap.fromTo(".textfield",
  {
    opacity: 0,
    scale: 0.8,
  }, {
  scale: 1,
  duration: 2,
  opacity: 1,
  delay: 2   
}
);

gsap.fromTo(".information__login",
  {
    x: 100,
    opacity: 0,
  }, {
  x: 0,
  duration: 2,
  opacity: 1,
  delay: 0
}
);

gsap.fromTo(".hr__login",
  {
    opacity: 0,
  }, {
  duration: 3,
  opacity: 1,
  delay: 0
}
);

gsap.fromTo(".button__login",
  {
    opacity: 0,
  }, {
  duration: 3,
  opacity: 1,
  delay: 4
}
);

gsap.fromTo(".other-user",
  {
    opacity: 0,
    x: -49,
  }, {
  x: -49,
  duration: 3,
  opacity: 1,
  delay: 4
}
);
