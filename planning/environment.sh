# Source for this task's dependency commands; no global configuration changes.
export npm_config_cache=/var/tmp/codex-community-ai/npm
export PIP_CACHE_DIR=/var/tmp/codex-community-ai/pip
export PLAYWRIGHT_BROWSERS_PATH=/var/tmp/codex-community-ai/browsers
export HF_HOME=/var/tmp/codex-community-ai/models
export PYENV_ROOT=/var/tmp/codex-community-ai/pyenv
export NVM_DIR=/var/tmp/codex-community-ai/nvm
export XDG_CACHE_HOME=/var/tmp/codex-community-ai/cache
# Any virtualenvs, node_modules or downloaded weights belong beneath
# /var/tmp/codex-community-ai as well; npm's cache setting does not move node_modules.
