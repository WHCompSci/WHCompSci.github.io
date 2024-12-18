// add new projects to the projects array. 
// use firstname last initial
const projects = [
    
    {
        name: "Schooldle",
        href: "/projects/schooldle/index.html",
        yearCreated: 2023, 
        authors: [
            "Nick S",
            "Tanner K"
        ]
    },
    {
        name: "PTYPE",
        href: "https://ptype-omega.vercel.app/",
        yearCreated: 2024,
        authors: [
            "Ryan D",
            "Sean B"
        ]
    },
    {
        name: "Othello AI",
        href: "/projects/othello-ai/index.html",
        yearCreated: 2024, 
        authors: [
            "Alex S",
            "Tanner K"
        ]
    },
    {
        name: "Neural Network",
        href: "/projects/neural-networks/index.html",
        yearCreated: 2024, 
        authors: [
            "Charlie P",
            "Oleksandr P",
            "Tanner K"
        ]
    },
    {
        name: "Sokoban",
        href: "/projects/sokoban/index.html",
        yearCreated: 2024, 
        authors: [
            "Franco G",
            "Tanner K"
        ]
    },
    {

        name: "Flappy Bird",
        href: "/projects/flappy-bird/index.html",
        yearCreated: 2024, 
        authors: [
            "Siena K",
            "Tanner K"
        ]

    },
    {
        name: "Penguin Game",
        href: "/projects/penguin-game/index.html",
        yearCreated: 2024, 
        authors: [
            "Nick S",
        ]
    },
    {
        
        name: "Color Wars",
        href: "/projects/color-wars/index.html",
        yearCreated: 2024, 
        authors: [
            "Alex S",
            "Tanner K"
        ]

    },
    {
        
        name: "Brownian Trees",
        href: "/projects/dla-simulation/index.html",
        yearCreated: 2024, 
        authors: [
            "Tanner K"
        ]
        
    },
    {
        name: "Wrestling Calculator",
        href: "/projects/wrestling/index.html",
        yearCreated: 2023, 
        authors: [
            "Johnathan C",
            "Tanner K"
        ]
    },
    {
        name: "Othello",
        href: "/projects/othello/index.html",
        yearCreated: 2024, 
        authors: [
            "Alex S",
            "Nick S"
        ]
    },
    {
        name: "Text Formatter",
        href: "/projects/text-formatter/index.html",
        yearCreated: 2023, 
        authors: [
            "Cecilia O",
            "Tanner K"
        ]
    },
    

]

const container = document.querySelector("#card-list")
const card = (project) => 
`<a href="${project.href}" class="card" >
    <div class="card-content">
        <div class="card-heading">
            <h3 class="card-name">${project.name}</h3>
            <span class="year">${project.yearCreated}</span>
        </div>
        ${project.authors ? "<div class=\"authors-subheading\">Creators</div>" : ""}
        ${project.authors.map(a => `<span class="author">${a}</span>`).join(" ")}
    </div>
</a>`


container.innerHTML += projects.map(card).join(" ")
