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

<body style="background-color:black;">
	<h2>Aperture's Dall-E Proxy</h2>
	
	<form action="/" method="post">
	<label for="prompt">Write what you want to draw here, don't write taboo thing and please don't abuse my account!!!</label><br>
	<textarea id="prompt" name="prompt" rows="2" cols="50" placeholder="Enter a prompt here..."></textarea>
	<br>
	<input type="submit" value="Submit">
	</form>
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

function makeImagePage(url: string): Response {
	const imagePart = `

		<div class="imgbox">
			<img class="center-fit" src="${url}" alt="image">
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
		if (request.method === 'GET') {
			return makeImagePage("https://picsum.photos/512")
		}
		const userRequest: any = await request.formData()

		if (!userRequest.has("prompt")) {
			return makeErrorPage("no prompt provided")
		}
		const prompt = userRequest.get("prompt")
		const response = await fetch("https://api.openai.com/v1/images/generations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				prompt: prompt,
				user: "Aperture's Proxy API"
			})
		})
		const jsonResponse: any = await response.json()
		
		if (response.status !== 200)
			return makeErrorPage(jsonResponse.error.message)
		return makeImagePage(jsonResponse.data[0].url)
	}
}
