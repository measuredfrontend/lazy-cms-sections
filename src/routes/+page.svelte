<h1>Lazy CMS sections with full SSR</h1>
<p>The same six CMS sections, resolved four different ways. Open each page, then <strong>view the page source</strong> (Ctrl+U) and compare.</p>
<ol>
	<li><a href="/universal">Universal load</a>: eager map + lazy chunks resolved in <code>+page.ts</code>. Full HTML, split code.</li>
	<li><a href="/static">Static map</a>: everything imported up front. Full HTML, one big bundle.</li>
	<li><a href="/await-in-template"><code>{'{#await}'}</code> in the template</a>: sections missing from the HTML.</li>
	<li><a href="/onmount"><code>onMount</code> import</a>: sections missing from the HTML.</li>
</ol>
