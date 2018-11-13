cd $TRAVIS_BUILD_DIR
unamestr=`uname`
echo TRAVIS_BRANCH=$TRAVIS_BRANCH
## Set a branch variable so we can detect the current branch in webpack if we're in staging or develop branch
if [ $unamestr = 'Linux' ] && [ $TRAVIS_BRANCH = 'staging' ]
then
    export BRANCH=$TRAVIS_BRANCH
fi
if [ $unamestr = 'Linux' ] && [ $TRAVIS_BRANCH = 'develop' ] && [ -z $TRAVIS_PULL_REQUEST_BRANCH ]
then
    export BRANCH=$TRAVIS_BRANCH
fi

## Make the binaries
if [ "$unamestr" == 'Linux' ]
then
    npm run make
fi

## Publish the binaries if on release
if [ $TRAVIS_TAG ]
then
    npm run publish
fi