<template>
  <div class="realtime-config-area">
    <el-form ref="form" :model="cloudRecConfig" label-width="150px">
      <el-form-item label="Access Key:">
        <el-input v-model="cloudRecConfig.accessKey" placeholder="Access Key" size="large"/>
      </el-form-item>
      <el-form-item label="Secret Key:">
        <el-input v-model="cloudRecConfig.secretKey" placeholder="Secret Key" size="large"/>
      </el-form-item>
      <el-form-item label="Bucket:">
        <el-input v-model="cloudRecConfig.bucket" placeholder="Bucket" size="large"/>
      </el-form-item>
      <el-form-item label="Vendor:">
        <el-input v-model="cloudRecConfig.vendor" placeholder="Vendor" size="large"/>
      </el-form-item>
      <el-form-item label="Region:">
        <el-input v-model="cloudRecConfig.region" placeholder="Region" size="large"/>
      </el-form-item>
      <el-form-item label="File Name Prefix:">
        <el-input v-model="cloudRecConfig.fileNamePrefix" placeholder="file Name Prefix" size="large"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import cloudRecConfig from '@/components/manager/CloudRecordingConfig.js'
</script>

<style scoped lang="less">
</style>
