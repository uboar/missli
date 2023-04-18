git submodule update --init
git -C misskey config core.sparsecheckout true
echo /packages/misskey-js/ > .git/modules/misskey/info/sparse-checkout
git -C misskey read-tree -mu HEAD
cd misskey/packages/misskey-js
pnpm install
pnpm build