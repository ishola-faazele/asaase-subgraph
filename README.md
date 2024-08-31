# Asaase Subgraph

## Overview

The Asaase Subgraph is designed to index events and entities related to land ownership on the blockchain. This subgraph indexes various smart contract events, such as land minting, ownership transfers, and land value updates, making it possible to efficiently query and analyze land-related data.

## Files Overview

### 1. **subgraph.yaml**

The `subgraph.yaml` file defines the data sources, entities, and event handlers that this subgraph will index. It specifies the smart contract to be monitored, the events to listen for, and the entities that will be created or updated as a result.

- **Data Sources**: Specifies the smart contracts and block ranges to index.
- **Entities**: Defines the GraphQL entities that will be created in response to events.
- **Event Handlers**: Maps smart contract events to specific functions in the mappings file that process and store data.

### 2. **schema.graphql**

The `schema.graphql` file defines the GraphQL schema for the subgraph. This schema outlines the types of entities that will be indexed and stored in the subgraph.

- **Entities**: Each entity represents a piece of data that can be queried. For example, `LandDetails`, `Owner`, `Transfer`, etc.
- **Relationships**: The schema defines relationships between entities, such as an `Owner` having multiple `LandDetails`.

### 3. **Mappings**

Mappings are TypeScript files that contain functions for handling specific events emitted by the smart contract. These functions are responsible for creating and updating entities based on event data.

#### **Mapping Handlers:**
- **handleApproval**: Indexes approval events, tracking which accounts are approved to transfer specific tokens.
- **handleApprovalForAll**: Indexes events where an owner grants or revokes permission for an operator to manage all their tokens.
- **handleOwnershipTransferred**: Updates ownership records when land ownership is transferred.
- **handleTransfer**: Handles token transfer events, updating the corresponding `Owner` and `Transfer` entities.
- **handleLandMinted**: Indexes land minting events, creating a new `LandDetails` entity and updating the owner's record.
- **handleLandValueUpdated**: Updates the value of a specific land parcel when its value is modified.
- **handleBatchMetadataUpdate**: Handles batch updates to token metadata.
- **handleMetadataUpdate**: Handles updates to the metadata of individual tokens.

## Entities

### **Approval**
Tracks approval events, detailing which account is allowed to transfer specific tokens.

### **ApprovalForAll**
Tracks events where an owner approves or revokes an operator to manage all their tokens.

### **OwnershipTransferred**
Tracks the transfer of ownership from one account to another.

### **Transfer**
Logs the transfer of a token from one owner to another.

### **LandMinted**
Represents the event when new land is minted and registered on the blockchain.

### **LandValueUpdated**
Tracks changes to the value of specific land tokens.

### **Owner**
Represents the ownership details of an address, including the number of tokens owned and their cumulative value.

### **Coordinates**
Represents the GPS coordinates associated with the boundaries of a land parcel.

### **LandDetails**
Contains detailed information about each land token, including size, zoning, registration date, region, city, and more.

### **BatchMetadataUpdate**
Represents a batch update to metadata across multiple tokens.

### **MetadataUpdate**
Tracks updates to the metadata of individual tokens.

## How to Deploy the Subgraph

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Authenticate with The Graph**
   ```bash
   graph auth --product hosted-service <ACCESS_TOKEN>
   ```

3. **Create the Subgraph**
   ```bash
   graph create --node https://api.thegraph.com/deploy/ <SUBGRAPH_NAME>
   ```

4. **Deploy the Subgraph**
   ```bash
   graph deploy --product hosted-service <SUBGRAPH_NAME>
   ```

## Querying the Subgraph

Once deployed, you can query the subgraph using GraphQL. Below are some example queries:

- **Get Land Details by Token ID**
  ```graphql
  query {
    landDetails(id: "1") {
      size
      zoning
      region
      city
    }
  }
  ```

- **Get Owner Information**
  ```graphql
  query {
    owner(id: "0x123...") {
      totalTokens
      totalValue
      tokenIds
    }
  }
  ```

- **List All Transfers**
  ```graphql
  query {
    transfers(first: 10) {
      from
      to
      tokenId
    }
  }
  ```

## License

This project is licensed under the MIT License.

---

This README should give a clear overview of your project, guiding others on how to understand, deploy, and use the subgraph effectively. You can modify it further based on specific details of your implementation or project needs.
