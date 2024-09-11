'use strict';
const profileCard = document.querySelector('[data-profile-card]')
const repoPanel = document.querySelector('[data-repo-panel]')
const error = document.querySelector('[data-error]')
const forkPanel = document.querySelector('[data-fork-panel]')
const searchToggler = document.querySelector('[data-search-toggler]')
const searchField = document.querySelector('[data-search-field]')
const tabList = document.querySelector('.tab-list')
const tabBtns = document.querySelectorAll('[data-tab-btn]')
const tabPanels = document.querySelectorAll('[data-tab-panel]')
const followPanel = document.querySelector('[data-followers-panel]')
const followingPanel = document.querySelector('[data-following-panel]')

import { fetchData } from "./api";

const githubUser = {
    avatar_url: null,
    bio: null,
    blog: null,
    company: null,
    email: null,
    followers_url: null,
    following_url: null,
    location: null,
    name: null,
    profile_url: `https://api.github.com/users/gitbranch-usa`,
    repos_url: null,
    twitter: null,
    type: null,
    username: null,
    number_of_followers: null,
    number_of_following: null,
    number_of_public_repos: null
}



let forkedRepos = []

const setLocalStorage = function (key, data) {
    localStorage.setItem(key, data)
}

const getLocalStorage = function(key) {
    const localStorageData = localStorage.getItem(key)
    if (!localStorageData) return
    githubUser.profile_url = localStorageData
}

// getLocalStorage('github_profile')

const getFetchedData = data => {
    githubUser.avatar_url = data.avatar_url
    githubUser.bio = data.bio
    githubUser.blog = data.blog
    githubUser.company = data.company
    githubUser.email = data.email
    githubUser.followers_url = data.followers_url
    githubUser.following_url = data.following_url.replace('{/other_user}', '')
    githubUser.location = data.location
    githubUser.name = data.name
    githubUser.repos_url = data.repos_url
    githubUser.twitter = data.twitter_username
    githubUser.type = data.type.toLowerCase()
    githubUser.username = data.login
    githubUser.number_of_followers = data.followers
    githubUser.number_of_following = data.following
    githubUser.number_of_public_repos = data.public_repos
    updateProfileHTML()
    yesPointerEvents()
}

const getProfileError = () => {
    error.style.display = "grid"
    document.body.style.overflowY = 'hidden'
    error.innerHTML = `
                    <p class="title-1">Oops! :(</p>
                <p class="text">There is no account with the username ${githubUser.profile_url.split('/').at(4)}.</p>
    `
    yesPointerEvents()
}

const formatNumber = (num) => {
    return new Intl.NumberFormat('en', {
        notation: "compact",
        compactDisplay: "short"
    }).format(num)
}


// add event listener all multiple elements at once
const addEventOnElemenets = function (elements, eventType, callBack) {
    for (const element of elements) {
        element.addEventListener(eventType, callBack)
    }
}

// header scroll state
const  header = document.querySelector('[data-header]')
window.addEventListener('scroll', () => {
    const headerHeight = header.offsetHeight ;
    header.classList[window.scrollY > headerHeight? 'add' : 'remove']('active');
})

//search toggle
let isExpanded = false

searchToggler.addEventListener('click', function ()  {
    header.classList.toggle('search-active')
    isExpanded = isExpanded ? false : true
    this.setAttribute('aria-expanded', isExpanded)
    searchField.focus()
})

// tab navigation
let [lastActiveTabBtn] = tabBtns
let [lastActiveTabPanel] = tabPanels

const showPanel = () =>  {
    const currentTab = lastActiveTabBtn.getAttribute('aria-controls')
    const foundPanel = Array.from(tabPanels).find(panel => panel.id === currentTab)
    lastActiveTabPanel = foundPanel
    lastActiveTabPanel.removeAttribute('hidden')
    if (lastActiveTabPanel.id === 'panel-1' ) {
        showRepoSkeleton('repo')
        setTimeout(() => {
            updateRepository()
        }, 500)
    }

    if (lastActiveTabPanel.id === 'panel-2') {
        showRepoSkeleton('fork')
        setTimeout(() => {
            updateForkHTML()
        }, 500)
    }

    if (lastActiveTabPanel.id === 'panel-3') {
        showFollowSkeleton('followers')
        setTimeout(() => {
            fetchData(`https://corsproxy.io/?${githubUser.followers_url}?sort=created&per_page=50`, updateFollowers, err => console.error(err) )
        }, 500)
    }

    if(lastActiveTabPanel.id === 'panel-4') {
        showFollowSkeleton('following')
        setTimeout(() => {
            fetchData(`https://corsproxy.io/?${githubUser.following_url}?sort=created&per_page=50`, updateFollowing, err => console.error(err) )
        }, 500)
    }
}

tabList.addEventListener('click', (e) => {
    if (!e.target.closest('.tab-btn')) return
    const tab = e.target
    if (tab === lastActiveTabBtn) return
    lastActiveTabBtn.setAttribute('aria-selected', false)
    tab.setAttribute('aria-selected', true)
    lastActiveTabPanel.setAttribute('hidden', '')
    lastActiveTabBtn = tab
    showPanel()
})

const resetTabs = function () {
    setTimeout(() => {
        tabList.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        })
    }, 500)
    Array.from(tabBtns).forEach(tab => {
        return tab.setAttribute('aria-Selected', false)
    })
    Array.from(tabPanels).forEach(panel => {
        return panel.setAttribute('hidden', '')
    })
    lastActiveTabBtn = tabBtns[0]
    lastActiveTabPanel = tabPanels[0]
    lastActiveTabBtn.setAttribute('aria-selected', 'true')
    lastActiveTabPanel.removeAttribute('hidden')
}
const noPointerEvents = function () {
    Array.from(tabBtns).forEach(tab => {
        tab.style.pointerEvents = 'none'
    })
    searchToggler.style.pointerEvents = 'none'
    searchField.style.pointerEvents = 'none'
}
const yesPointerEvents= function () {
    Array.from(tabBtns).forEach(tab => {
        tab.style.pointerEvents = 'auto'
    })
    searchToggler.style.pointerEvents = 'auto'
    searchField.style.pointerEvents = 'auto'
}

/*keyboard accesibility for tab buttons*/

addEventOnElemenets(tabBtns, 'keydown', function(e) {
    const nextElement = this.nextElementSibling
    const previousElement = this.previousElementSibling

    if (e.key === 'ArrowRight' && nextElement) {
        this.setAttribute('tabindex', '-1')
        nextElement.setAttribute('tabindex', '0')
        nextElement.focus()
    }

    else if(e.key === 'ArrowLeft' && previousElement) {
        this.setAttribute('tabindex', '-1')
        previousElement.setAttribute('tabindex', '0')
        previousElement.focus()
    }
})

//search
const searchSubmit = document.querySelector('[data-search-submit]')
let apiUrl = ""

const searchUser = function () {
    if (!searchField.value) return
    if (githubUser.username === searchField.value) {
        header.classList.remove('search-active')
        return
    }
    header.classList.remove('search-active')
    searchToggler.setAttribute('aria-expanded', false)
    apiUrl = `https://api.github.com/users/${searchField.value}`
    githubUser.profile_url = apiUrl
    searchField.value =''
    updateProfile(githubUser.profile_url)
}

searchSubmit.addEventListener('click', searchUser)
searchField.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchUser()
})

//profile 

const showRepoSkeleton = function (type) {
    if (type === 'repo') {
        repoPanel.innerHTML = `
        <div class="card repo-skeleton">

        <div class="card-body">
            <div class="skeleton title-skeleton"></div>
            <div class="skeleton text-skeleton text-1"></div>
            <div class="skeleton text-skeleton text-2"></div>
        </div>

        <div class="card-footer">
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
        </div>

    </div>
`.repeat(6)
    }

    if (type === 'fork') {
        forkPanel.innerHTML = `
           <div class="card repo-skeleton">

        <div class="card-body">
            <div class="skeleton title-skeleton"></div>
            <div class="skeleton text-skeleton text-1"></div>
            <div class="skeleton text-skeleton text-2"></div>
        </div>

        <div class="card-footer">
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
        </div>

    </div>
        `.repeat(6)
    }
}

const showFollowSkeleton = function(type) {
    if (type === 'followers') {
        followPanel.innerHTML = `
                    <div class="card follower-skeleton">
                        <div class="skeleton avatar-skeleton"></div>
                        <div class="skeleton title-skeleton"></div>
                    </div>
        `.repeat(6)
    }

    if (type === 'following') {
        followingPanel.innerHTML = `
                    <div class="card follower-skeleton">
                        <div class="skeleton avatar-skeleton"></div>
                        <div class="skeleton title-skeleton"></div>
                    </div>
        `.repeat(6)
    }
}

const updateProfileHTML = function () {
    document.body.style.overflowY = 'visible'
    profileCard.innerHTML = `
                    <figure class="${githubUser.type === 'user' ? 'avatar-circle ' : 'avatar-rounded '}img-holder " style="--width: 280; --height: 280">
                    <img class="img-cover" width="280" height="280" alt="${githubUser.username} profile picture"  src="${githubUser.avatar_url}">
                </figure>

                ${githubUser.name ? `<h1 class="title-2">${githubUser.name}</h1>` : ''}
    
                <p class="username text-logo-primary">${githubUser.username}</p>

                ${githubUser.bio ? `<p class="bio">${githubUser.bio}</p>` : ''}

                <a href="https://github.com/${githubUser.username}" target="_blank" class="btn btn-secondary">
                    <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                    <span class="span">See on Github</span>
                </a>

                <ul class="profile-meta">

                ${githubUser.company ? `
                    <li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">apartment</span>
                        <span class="meta-text">${githubUser.company}</span>
                    </li>
                    ` : ''}

                    ${githubUser.location ? `
                    <li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">location_on</span>
                        <span class="meta-text">${githubUser.location}</span>
                    </li>
                        ` : ''}

                    ${githubUser.email ? `
                    <li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">mail</span>
                            <a href="mailto:${githubUser.email}" target="_blank" class="meta-text">${githubUser.email}</a>
                    </li>
                        ` : ''}

                    ${githubUser.blog ? `
                    <li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">link</span>
                                <a href="${githubUser.blog}" target="_blank" class="meta-text">${githubUser.blog}</a>
                    </li>
                        ` : ''}

                        ${githubUser.twitter ? `
                     <li class="meta-item">
                        <div class="twitter-wrapper">
                            <svg class="twitter-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="24px" height="36px" fill-rule="nonzero"><g fill="var(--primary)" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M50.0625,10.4375c-1.84766,0.82031 -3.82812,1.37109 -5.91016,1.62109c2.125,-1.27344 3.75781,-3.28906 4.52344,-5.6875c-1.98437,1.17578 -4.19141,2.03125 -6.53125,2.49219c-1.875,-2 -4.54687,-3.24609 -7.50391,-3.24609c-5.67969,0 -10.28516,4.60156 -10.28516,10.28125c0,0.80469 0.09375,1.58984 0.26953,2.34375c-8.54687,-0.42969 -16.12109,-4.52344 -21.19531,-10.74609c-0.88672,1.52344 -1.39062,3.28906 -1.39062,5.17187c0,3.56641 1.8125,6.71484 4.57422,8.5625c-1.6875,-0.05469 -3.27344,-0.51953 -4.66016,-1.28906c0,0.04297 0,0.08594 0,0.12891c0,4.98438 3.54688,9.13672 8.24609,10.08594c-0.85937,0.23438 -1.76953,0.35938 -2.70703,0.35938c-0.66406,0 -1.30859,-0.0625 -1.9375,-0.1875c1.3125,4.08203 5.10938,7.0625 9.60547,7.14453c-3.51562,2.75781 -7.94922,4.39844 -12.76953,4.39844c-0.83203,0 -1.64844,-0.04687 -2.44922,-0.14453c4.54687,2.92188 9.95312,4.62109 15.76172,4.62109c18.91406,0 29.25781,-15.66797 29.25781,-29.25391c0,-0.44531 -0.01172,-0.89453 -0.02734,-1.33203c2.00781,-1.44922 3.75,-3.26172 5.12891,-5.32422z"></path></g></g></svg>
                        </div>
                        <a href="https://x.com/${githubUser.twitter}" target="_blank" class="meta-text">${githubUser.twitter}</a>
                    </li>
                            ` : ''}
                </ul>

                <ul class="profile-stats">

                    <li class="stats-item">
                        <span class="body">${formatNumber(githubUser.number_of_public_repos)}</span> @Repos
                    </li>

                    <li class="stats-item">
                        <span class="body">${formatNumber(githubUser.number_of_followers)}</span> @Followers
                    </li>

                    <li class="stats-item">
                        <span class="body">${formatNumber(githubUser.number_of_following)}</span> @Following
                    </li>
                </ul>

                <div class="footer">
                    <p class="copyright">&copy; 2024 keandrelmiller</p>
                </div>
    `
    updateRepository ()
updateRepositoryHTML}

const updateRepositoryHTML = function (data) {
    repoPanel.innerHTML = `<h2 class="sr--only">Repositories</h2>`;

    forkedRepos = data.filter(item => item.fork);
    const repositories = data.filter(item => !item.fork);

    if (repositories.length) {
        repositories.forEach(repo => {
            const repoCard = document.createElement('article'); // Create a new card for each repo
            repoCard.classList.add('card', 'repo-card');

            repoCard.innerHTML = `
                <div class="card-body">
                    <a href="${repo.html_url}" target="_blank" class="card-title">
                        <h3 class="title-3">${repo.name}</h3>
                    </a>
                    ${repo.description ? `
                        <p class="card-text">${repo.description}</p>
                    ` : ''}
                    <span class="badge">${repo.private ? "Private" : "Public"}</span>
                </div>
                <div class="card-footer">
                    ${repo.language ? `
                        <div class="meta-item">
                            <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                            <span class="span">${repo.language}</span>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                        <span class="span">${formatNumber(repo.stargazers_count)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                        <span class="span">${formatNumber(repo.forks_count)}</span>
                    </div>
                </div>
            `;

            repoPanel.appendChild(repoCard);
        });
    }
    else if (repositories.length === 0) {
        repoPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops!  :(</p>
                    <p class="text">@${githubUser.username} doesn't have any public repositories yet.</p>
                </div>
        `
    }
}


const updateProfile = function (profileUrl) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
   error.style.display = 'none'
   document.body.overflowY = 'visible'
   profileCard.innerHTML =  `
                   <div class="profile-skeleton">
                    <div class="skeleton avatar-skeleton"></div>
                    <div class="skeleton title-skeleton"></div>
                    <div class="skeleton text-skeleton text-1"></div>
                    <div class="skeleton text-skeleton text-2"></div>
                    <div class="skeleton text-skeleton text-3"></div>
                </div>
   `
   repoPanel.innerHTML = `
                        <div class="card repo-skeleton">

                        <div class="card-body">
                            <div class="skeleton title-skeleton"></div>
                            <div class="skeleton text-skeleton text-1"></div>
                            <div class="skeleton text-skeleton text-2"></div>
                        </div>

                        <div class="card-footer">
                            <div class="skeleton text-skeleton"></div>
                            <div class="skeleton text-skeleton"></div>
                            <div class="skeleton text-skeleton"></div>
                        </div>

                    </div>
   `.repeat(6)
   resetTabs()
   noPointerEvents()
   searchField.blur()
   setLocalStorage('github_profile', githubUser.profile_url)
   setTimeout(() => fetchData(`https://corsproxy.io/?${githubUser.profile_url}`, getFetchedData, getProfileError), 500)
}

document.addEventListener('DOMContentLoaded', () => {
    updateProfile(githubUser.profile_url)
})

const updateRepository  = function () {
    fetchData(`https://corsproxy.io/?${githubUser.repos_url}?sort=created&per_page=25`, updateRepositoryHTML, (err) => {
        console.error(err);
    })
}
const updateForkHTML = function () {
    forkPanel.innerHTML = `<h2 class="sr--only">Forked Repositories</h2>`;

    if (forkedRepos.length) {
        forkedRepos.forEach(repo => {
            const forkCard = document.createElement('article'); 
            forkCard.classList.add('card', 'repo-card');

            forkCard.innerHTML = `
                <div class="card-body">
                    <a href="${repo.html_url}" target="_blank" class="card-title">
                        <h3 class="title-3">${repo.name}</h3>
                    </a>
                    ${repo.description ? `
                        <p class="card-text">${repo.description}</p>
                    ` : ''}
                    <span class="badge">${repo.private ? "Private" : "Public"}</span>
                </div>
                <div class="card-footer">
                    ${repo.language ? `
                        <div class="meta-item">
                            <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                            <span class="span">${repo.language}</span>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                        <span class="span">${formatNumber(repo.stargazers_count)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                        <span class="span">${formatNumber(repo.forks_count)}</span>
                    </div>
                </div>
            `;

            forkPanel.appendChild(forkCard);
        });
    }
    else if (forkedRepos.length === 0) {
        forkPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops!  :(</p>
                    <p class="text">@${githubUser.username} doesn't have any public forked repositories yet.</p>
                </div>
        `
    }
}

const updateFollowers = function (data) {
    const followers = data
    followPanel.innerHTML = `<h2 class="sr--only">Followers</h2>`

    if (followers.length) {
        followers.forEach(follower => {
            const followCard = document.createElement('article'); // Create a new card for each repo
            followCard.classList.add('card', 'follower-card');
            followCard.innerHTML = `
                        <figure class="avatar-circle img-holder">
                            <img src="${follower.avatar_url}" alt="${follower.login} profile picture" class="img-cover" loading="lazy"  width="56" height="56">
                        </figure>
    
                        <h3 class="card-title">${follower.login}</h3>
                        <button class="icon-btn" aria-label="Go to ${follower.login} profile">
                        <a href="${follower.html_url}" target="_blank">
                            <span class="material-symbols-rounded">link</span>
                        </a>
                        </button>
             
            `
            followPanel.appendChild(followCard)
        })
    }

    else if (followers.length === 0) {
        followPanel.innerHTML =  `
        <div class="error-content">
            <p class="title-1">Oops!  :(</p>
            <p class="text">@${githubUser.username} doesn't have any followers yet.</p>
        </div>
`
    }
}

const updateFollowing = function (data) {
    const following = data
    followingPanel.innerHTML = `<h2 class="sr--only">following</h2>`

    if (following.length) {
        following.forEach(follow => {
            const followingCard = document.createElement('article'); 
            followingCard.classList.add('card', 'follower-card');
            followingCard.innerHTML = `
                        <figure class="avatar-circle img-holder">
                            <img src="${follow.avatar_url}" alt="${follow.login} profile picture" class="img-cover" loading="lazy"  width="56" height="56">
                        </figure>
    
                        <h3 class="card-title">${follow.login}</h3>
                        <button class="icon-btn" aria-label="Go to ${follow.login} profile">
                        <a href="${follow.html_url}" target="_blank">
                            <span class="material-symbols-rounded">link</span>
                        </a>
                        </button>
             
            `
            followingPanel.appendChild(followingCard)
        })
    }

    else if (following.length === 0) {
        followingPanel.innerHTML =  `
        <div class="error-content">
            <p class="title-1">Oops!  :(</p>
            <p class="text">@${githubUser.username} isn't following anyone yet.</p>
        </div>
`
    }
}