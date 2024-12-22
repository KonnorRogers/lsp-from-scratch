Follow along of TJ Devries "LSP from scratch" video, but in JavaScript instead of Golang.

<https://www.youtube.com/watch?v=YsdlcQoHqPY&t=476s>

## Getting started

```bash
git clone https://github.com/KonnorRogers/lsp-from-scratch
cd lsp-from-scratch
pnpm install
```

## Adding to Neovim

```lua
-- ~/.config/nvim/plugin/lsp_test.lua
-- OR if you're like me:
-- ~/.vim/lua/plugins/lsp_test.lua  and then in "~/.vim/init.lua" -> require("plugins.lsp_test")

local client = vim.lsp.start_client {
  name = "lsp-from-scratch",
  cmd = { vim.fn.expand("$HOME/projects/lsp-from-scratch/exports/server.js") },
}

vim.api.nvim_create_autocmd("FileType", {
  pattern = "markdown",
  callback = function ()
    if not client then
      vim.cmd.echo("\"Something went wrong\"")
      return
    end

    vim.lsp.buf_attach_client(0, client)
  end
})
```

Then open "test.md" and you should get diagnostics!
