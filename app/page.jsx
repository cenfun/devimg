'use client';

import './github-markdown.css';
import IconGithub from './icons/github';

import UsageNpmDownloads from './npm/downloads/usage';
import UsageGithubContributions from './github/contributions/usage';
import UsageGithubLanguages from './github/languages/usage';
import UsageGithubProfile from './github/profile/usage';

export default function Home() {

    const relatedProjects = [
        'https://github.com/badges/shields',
        'https://github.com/badgen/badgen.net',
        'https://github.com/anuraghazra/github-readme-stats',
        'https://github.com/denvercoder1/github-readme-streak-stats',
        'https://github.com/vn7n24fzkq/github-profile-summary-cards',
        'https://github.com/badges/awesome-badges',
        'https://github.com/antonkomarev/github-profile-views-counter'
    ];

    return (
        <div className="markdown-body">
            <h1>
                <div className="inline">
                    <div className="title">DevImg</div>
                    <a href="https://github.com/cenfun/devimg" target="_blank" className="github">
                        <IconGithub></IconGithub>
                    </a>
                </div>
            </h1>
            <p>Generating npm or github status for profile README.</p>
            <ul className="capitalize">
                <li><a href="#npm-downloads">npm downloads</a></li>
                <li><a href="#github-contributions">github contributions</a></li>
                <li><a href="#github-languages">github languages</a></li>
                <li><a href="#github-profile">github profile</a></li>
            </ul>

            <UsageNpmDownloads></UsageNpmDownloads>
            <UsageGithubContributions></UsageGithubContributions>
            <UsageGithubLanguages></UsageGithubLanguages>
            <UsageGithubProfile></UsageGithubProfile>

            <div className="header">related projects</div>
            <ul open>
                {relatedProjects.map((it, i) => {
                    return (
                        <li key={i}><a href={it} target="_blank">{it.split('/').pop()}</a></li>
                    );
                })}

            </ul>

            <div className="footer"></div>
        </div>
    );
}
