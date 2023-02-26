import { serve } from "aleph/react-server";
import routes from "./routes/_export.ts";
import * as path from "https://deno.land/std@0.178.0/path/mod.ts";
import { readableStreamFromIterable } from "https://deno.land/std@0.178.0/streams/mod.ts";

const middlewares: Middleware[] = [];
if (Deno.env.get("APP_ENV") === "DEV") {
    middlewares.push({
        name: "hotcss",
        async fetch(req, ctx) {
            const url = new URL(req.url);
            if (url.pathname === "/__hotcss") {
                const { socket, response } = Deno.upgradeWebSocket(req);
                let files = url.searchParams.getAll("files");
                files = files.map((f) =>
                    path.join(
                        path.dirname(new URL(import.meta.url).pathname),
                        f
                    )
                );
                const watcher = Deno.watchFs(files);
                socket.onclose = () => {
                    watcher.close();
                };
                readableStreamFromIterable(watcher).pipeTo(
                    new WritableStream({
                        async write(event) {
                            if (
                                event.kind === "modify" &&
                                socket.readyState === socket.OPEN
                            ) {
                                socket.send(
                                    JSON.stringify({
                                        file: event.paths[0],
                                        content: await Deno.readTextFile(
                                            event.paths[0]
                                        ),
                                    })
                                );
                            }
                        },
                        close() {
                            socket.close();
                        },
                    })
                );
                return response;
            }

            return ctx.next();
        },
    });
}

serve({
    router: { routes },
    ssr: true,
    middlewares,
});
