FROM mcr.microsoft.com/devcontainers/base:resolute

# GitHub CLI and Claude Code come from their vendors' apt repositories, not dev container
# features, so the container can upgrade them with apt on every start (see postStartCommand in
# devcontainer.json). Claude Code uses the `latest` channel, which serves every release as soon as
# it ships. The signing keys are downloaded over HTTPS and not pinned to a fingerprint, so a key
# rotation needs no change here.
#   GitHub CLI: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
#   Claude Code: https://code.claude.com/docs/en/setup#install-with-linux-package-managers
# The same RUN installs what GitHub Copilot's Linux sandbox needs for network access: bubblewrap,
# slirp4netns (the sandbox's private network), util-linux (unshare, nsenter), iproute2 (ip) and
# iptables (iptables, ip6tables and their -restore variants). The rest of its requirements come
# from the container runtime, not packages: /dev/net/tun, the nf_conntrack kernel module and
# unprivileged user and network namespaces. The docker-in-docker feature runs the container
# privileged, which provides them.
#   https://docs.github.com/en/copilot/concepts/about-cloud-and-local-sandboxes
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl; \
    install -d -m 0755 /etc/apt/keyrings; \
    curl --proto '=https' --tlsv1.2 -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /etc/apt/keyrings/githubcli-archive-keyring.gpg; \
    curl --proto '=https' --tlsv1.2 -fsSL https://downloads.claude.ai/keys/claude-code.asc \
        -o /etc/apt/keyrings/claude-code.asc; \
    chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg /etc/apt/keyrings/claude-code.asc; \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list; \
    echo "deb [signed-by=/etc/apt/keyrings/claude-code.asc] https://downloads.claude.ai/claude-code/apt/latest latest main" \
        > /etc/apt/sources.list.d/claude-code.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends gh claude-code \
        bubblewrap slirp4netns util-linux iproute2 iptables; \
    gh --version; \
    claude --version; \
    rm -rf /var/lib/apt/lists/*
