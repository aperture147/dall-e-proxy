export interface Env {
	OPENAI_API_KEY: string;
}

const topPart = `<!DOCTYPE html>
<html>
<head>
	<title>Aperture's Dall-E Proxy</title>
	<style>
		* {
			margin: 0;
			padding: 0;
		}
		.imgbox {
			display: grid;
			height: 100%;
		}
		.center-fit {
			max-width: 100%;
			max-height: 100vh;
			margin: auto;
		}
		body {
			font-family: Helvetica, sans-serif;
			color: #D3D3D3;
		}
	</style>
</head>

<body style="background-color: black;">
	<div style="text-align: center; margin-top: 25px;">
		<h1>Aperture's Dall-E Proxy</h1>
		<br>
		<p>
		Write what you want to draw here, please don't write taboo things or don't abuse my account!!!
		</p>
		<br>
		<form action="/" method="post">
			<input type="text" id="prompt" name="prompt" size="50" placeholder="Write your prompt here...">
			<select name="size" id="size">
				<option value="256x256">256x256</option>
				<option value="512x512" selected="selected">512x512</option>
				<option value="1024x1024">1024x1024</option>
			</select>
			<input type="submit" value="Submit">
		</form>
	</div>
	<br>
`
const bottomPart = `
</body>
</html>`

function makeErrorPage(msg: any): Response {
	const errorPart = `

		<p>
		Cannot generate image, error reason: ${msg}
		</p>

	`
	return new Response(topPart + errorPart + bottomPart, {
		headers: {
			"content-type": "text/html;charset=UTF-8",
		},
	});
}

function makeImagePage(url: string, title: string): Response {
	const imagePart = `

		<div class="imgbox">
			
			<div style="text-align: center;">
				<p>${title} <a href="${url}" download>Download</p>
				
			</div>
			<br>
			<a class="center-fit" href="${url}">
				<img src="${url}" alt="${title}" title="${title}">
			</a>
		</div>

	`
	return new Response(topPart + imagePart + bottomPart, {
		headers: {
			"content-type": "text/html;charset=UTF-8",
		},
	});
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		if (request.method === 'GET')
			return makeImagePage("https://picsum.photos/512", "Lorem Picsum")
		
		const userRequest: any = await request.formData()

		if (!userRequest.has("prompt")) {
			return makeErrorPage("no prompt provided")
		}
		const prompt = userRequest.get("prompt")
		const size = userRequest.get("size")
		const response = await fetch("https://api.openai.com/v1/images/generations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				prompt: prompt,
				size: size,
				user: "Aperture's Proxy API"
			})
		})
		const jsonResponse: any = await response.json()
		
		if (response.status !== 200)
			return makeErrorPage(jsonResponse.error.message)
		return makeImagePage(jsonResponse.data[0].url, prompt)
	}
}
