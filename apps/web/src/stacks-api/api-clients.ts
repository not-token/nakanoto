import {
  Configuration,
  SmartContractsApi,
} from "@stacks/blockchain-api-client";

export const apiClientConfig = new Configuration();
export const contractsApi = new SmartContractsApi(apiClientConfig);
