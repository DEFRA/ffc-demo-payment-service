@Library('defra-library@4') _

def containerSrcFolder = '\\/home\\/node'
def localSrcFolder = '.'
def lcovFile = './test-output/lcov.info'
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def qualityGateTimeout = 10
def repoName = ''
def pr = ''
def containerTag = ''
def mergedPrNo = ''

node {
  checkout scm
  try {
    stage('Set GitHub status as pending') {
      build.setGithubStatusPending()
    }

    stage('Set PR, and containerTag variables') {
      (repoName, pr, containerTag, mergedPrNo) = build.getVariables(version.getPackageJsonVersion())
    }

    if (pr != '') {
      stage('Verify version incremented') {
        version.verifyPackageJsonIncremented()
      }
    }

    stage('Helm lint') {
      test.lintHelm(repoName)
    }

    stage('Push container image') {
      build.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, repoName, containerTag)
    }

    if (pr != '') {
      stage('Helm install') {
        helm.deployChart('dev', DOCKER_REGISTRY, repoName, containerTag)
      }
    }
    else {
      stage('Publish chart') {
        helm.publishChart(DOCKER_REGISTRY, repoName, containerTag)
      }

      stage('Trigger GitHub release') {
        withCredentials([
          string(credentialsId: 'github-auth-token', variable: 'gitToken')
        ]) {
          release.trigger(containerTag, repoName, containerTag, gitToken)
        }
      }

      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: "$repoName-deploy-token", variable: 'jenkinsToken')
        ]) {
          deploy.trigger(JENKINS_DEPLOY_SITE_ROOT, repoName, jenkinsToken, ['chartVersion': containerTag, 'environment': 'dev'])
        }
      }
    }

    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        helm.undeployChart('dev', repoName, mergedPrNo)
      }
    }

    stage('Set GitHub status as success'){
      build.setGithubStatusSuccess()
    }
  } catch(e) {
    stage('Set GitHub status as fail') {
      build.setGithubStatusFailure(e.message)
    }

    stage('Send build failure slack notification') {
      notifySlack.buildFailure(e.message, "#generalbuildfailures")
    }

    throw e
  } finally {
    stage('Clean up test output') {
      test.deleteOutput(repoName, containerSrcFolder)
    }

  }
}

