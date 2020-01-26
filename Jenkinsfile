@Library('defra-library@0.0.9')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def registry = '562955126301.dkr.ecr.eu-west-2.amazonaws.com'
def regCredsId = 'ecr:eu-west-2:ecr-user'
def kubeCredsId = 'FFCLDNEKSAWSS001_KUBECONFIG'
def imageName = 'ffc-demo-payment-service'
def jenkinsDeployJob = 'ffc-demo-payment-service-deploy'
def repoName = 'ffc-demo-payment-service'
def pr = ''
def mergedPrNo = ''
def containerTag = ''
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def containerSrcFolder = '\\/usr\\/src\\/app'
def localSrcFolder = '.'
def lcovFile = './test-output/lcov.info'
def timeoutInMinutes = 5

node {
  checkout scm
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName)
      defraUtils.setGithubStatusPending()
    }
    stage('Helm lint') {
      defraUtils.lintHelm(imageName)
    }
    stage('Build test image') {
      defraUtils.buildTestImage(imageName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(imageName, BUILD_NUMBER)
    }
    stage('Create Test Report JUnit'){
      defraUtils.createTestReportJUnit()
    }
    stage('Fix absolute paths in lcov file') {
      defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    }
    stage('SonarQube analysis') {
      defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : repoName, 'sonar.sources' : '.'])
    }
    stage("Code quality gate") {
      defraUtils.waitForQualityGateResult(timeoutInMinutes)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(registry, imageName, containerTag)
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
          string(credentialsId: 'ffc-demo-payment-service-deploy-token', variable: 'jenkinsToken')
        ]) {
          defraUtils.triggerDeploy(jenkinsDeployUrl, jenkinsDeployJob, jenkinsToken, ['chartVersion':'1.0.0'])
        }
      }
    } else {
      stage('Helm install') {
        withCredentials([
          string(credentialsId: 'sqsQueueEndpoint', variable: 'sqsQueueEndpoint'),
          string(credentialsId: 'scheduleQueueUrlPR', variable: 'scheduleQueueUrl'),
          string(credentialsId: 'scheduleQueueAccessKeyIdListen', variable: 'scheduleQueueAccessKeyId'),
          string(credentialsId: 'scheduleQueueSecretAccessKeyListen', variable: 'scheduleQueueSecretAccessKey'),
          string(credentialsId: 'paymentQueueUrlPR', variable: 'paymentQueueUrl'),
          string(credentialsId: 'paymentQueueAccessKeyIdSend', variable: 'paymentQueueAccessKeyId'),
          string(credentialsId: 'paymentQueueSecretAccessKeySend', variable: 'paymentQueueSecretAccessKey'),
          string(credentialsId: 'postgresExternalNamePaymentsPR', variable: 'postgresExternalName'),
          usernamePassword(credentialsId: 'postgresPaymentsPR', usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword'),
        ]) {
          def helmValues = [
            /container.scheduleQueueEndpoint="$sqsQueueEndpoint"/,
            /container.scheduleQueueUrl="$scheduleQueueUrl"/,
            /container.scheduleQueueAccessKeyId="$scheduleQueueAccessKeyId"/,
            /container.scheduleQueueSecretAccessKey="$scheduleQueueSecretAccessKey"/,
            /container.scheduleCreateQueue="false"/,
            /container.paymentQueueEndpoint="$sqsQueueEndPoint"/,
            /container.paymentQueueUrl="$paymentQueueUrl"/,
            /container.paymentQueueAccessKeyId="$paymentQueueAccessKeyId"/,
            /container.paymentQueueSecretAccessKey="$paymentQueueSecretAccessKey"/,
            /container.paymentCreateQueue="false"/,
            /postgresExternalName="$postgresExternalName"/,
            /postgresPassword="$postgresPassword"/,
            /postgresUsername="$postgresUsername"/
          ].join(',')

          def extraCommands = [
            "--values ./helm/ffc-demo-payment-service/jenkins-aws.yaml",
            "--set $helmValues"
          ].join(' ')

          defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
          echo "Build available for review"
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
      }
    }
    defraUtils.setGithubStatusSuccess()
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    throw e
  } finally {
    defraUtils.deleteTestOutput(imageName)
  }
}
