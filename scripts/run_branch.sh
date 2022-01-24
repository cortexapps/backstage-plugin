command -v expect > /dev/null || { echo 'Script requires "expect" to run.'; exit 1; }
command -v npx > /dev/null || { echo 'Script requires "npx" to run.'; exit 1; }

if [ ! -d '/usr/local/opt/nvm' ] ; then
    echo 'Script requires "nvm" to run.'
    exit 1
else
    source '/usr/local/opt/nvm/nvm.sh'
fi

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
plugin_dir=$(echo $script_dir | sed -e 's/\/scripts//g')
backstage_dir="${script_dir}/backstage-cortex"

cd $plugin_dir
plugin_version=$(cat package.json | python -c "import sys; import json; value = json.loads(sys.stdin.read()); print(value[\"version\"])")
echo "Building and publishing backstage-plugin@${plugin_version}"

if ! (nvm install 14.17.0 && yarn install && yarn tsc && yarn build && yalc publish --push) ; then
    echo 'Failed to build plugin.'
    exit 1
fi

if [ ! -d "${backstage_dir}" ] ; then
    echo 'Downloading Backstage'
    cd $script_dir
    ./download_backstage.sh
    cd backstage-cortex
    echo "export { cortexPlugin } from '@cortexapps/backstage-plugin';" > packages/app/src/plugins.ts
    patch -p1 < ../diff.patch
    yalc add "@cortexapps/backstage-plugin@${plugin_version}" --pure
    nvm install 14.17.0
    yarn install
fi
