import './github-markdown.css';

export default function Home() {

    const labelDownloads = '{total}/month';
    const labelContributions = '{name} - {total} contributions past year';
    const labelLanguages = '{name} - {total} used languages';

    return (
        <div class="markdown-body">
            <a name="top"></a>
            <h1>Welcome to DevImg</h1>

            <h2>Endpoint</h2>
            <pre><code>https://devimg.vercel.app/:platform/:type/:ns?/:name
            </code></pre>


            <h2>npm downloads</h2>
            <pre><code>https://devimg.vercel.app/npm/downloads/:ns?/:name
            </code></pre>
            <details>
                <summary>query</summary>
                <ul>
                    <li>height=20</li>
                    <li>radius=15%</li>
                    <li>color=#44cc11</li>
                    <li>bg=#007ec6</li>
                    <li>label={labelDownloads}</li>
                    <li>output=svg | json</li>
                </ul>
            </details>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Downloads</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>lz-utils</td>
                        <td><img src="/npm/downloads/lz-utils?label=%7Btotal%7D%20downloads" alt=""/></td>
                    </tr>
                    <tr>
                        <td>vue</td>
                        <td><img src="/npm/downloads/vue?label=&height=30&radius=10" alt=""/></td>
                    </tr>
                    <tr>
                        <td>monocart-coverage-reports</td>
                        <td><img src="/npm/downloads/monocart-coverage-reports" alt=""/></td>
                    </tr>
                    <tr>
                        <td>@koa/router</td>
                        <td><img src="/npm/downloads/@koa/router" alt=""/></td>
                    </tr>
                </tbody>
            </table>
            <p><a href="#top">▲Top</a></p>


            <h2>github contributions</h2>
            <pre><code>https://devimg.vercel.app/github/contributions/:name
            </code></pre>
            <details>
                <summary>query</summary>
                <ul>
                    <li>width=600</li>
                    <li>color=#44cc11</li>
                    <li>even=#f6f8fa</li>
                    <li>axis=#99999</li>
                    <li>bg=#ffffff</li>
                    <li>label={labelContributions}</li>
                    <li>output=svg | json</li>
                </ul>
            </details>
            <p>
                <img src="/github/contributions/cenfun" alt=""/>
            </p>
            <p><a href="#top">▲Top</a></p>


            <h2>github languages</h2>
            <pre><code>https://devimg.vercel.app/github/languages/:name
            </code></pre>
            <details>
                <summary>query</summary>
                <ul>
                    <li>width=600</li>
                    <li>limit=20</li>
                    <li>colors=dodgerblue,green,orangered...</li>
                    <li>bg=#ffffff</li>
                    <li>label={labelLanguages}</li>
                    <li>output=svg | json</li>
                </ul>
            </details>
            <p>
                <img src="github/languages/cenfun" alt=""/>
            </p>
            <p><a href="#top">▲Top</a></p>

        </div>
    );
}
