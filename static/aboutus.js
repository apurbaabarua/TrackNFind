document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".image-box");

    images.forEach((box, index) => {
        setTimeout(() => {
            box.classList.add("fadeIn");
        }, index * 300);
    });
});
document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let email = this.querySelector("input").value;
    
    if (email) {
        alert("Thank you for subscribing, " + email + "!");
        this.reset();
    }
});
