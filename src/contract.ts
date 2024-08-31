import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
  LandMinted as LandMintedEvent,
  LandValueUpdated as LandValueUpdatedEvent,
  BatchMetadataUpdate as BatchMetadataUpdateEvent,
  MetadataUpdate as MetadataUpdateEvent
} from "../generated/Contract/Contract"
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer,
  LandMinted,
  LandValueUpdated,
  Owner,
  Coordinates,
  LandDetails,
  BatchMetadataUpdate,
  MetadataUpdate
} from "../generated/schema"
import { BigInt, Bytes, ByteArray } from "@graphprotocol/graph-ts"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update Owner entities
  let fromOwner = Owner.load(event.params.from.toHexString())
  if (fromOwner == null) {
    fromOwner = new Owner(event.params.from.toHexString())
    fromOwner.address = event.params.from
    fromOwner.totalTokens = BigInt.fromI32(0)
    fromOwner.totalValue = BigInt.fromI32(0)
    fromOwner.tokenIds = []
  }

  let toOwner = Owner.load(event.params.to.toHexString())
  if (toOwner == null) {
    toOwner = new Owner(event.params.to.toHexString())
    toOwner.address = event.params.to
    toOwner.totalTokens = BigInt.fromI32(0)
    toOwner.totalValue = BigInt.fromI32(0)
    toOwner.tokenIds = []
  }

  fromOwner.totalTokens = fromOwner.totalTokens.minus(BigInt.fromI32(1))
  toOwner.totalTokens = toOwner.totalTokens.plus(BigInt.fromI32(1))

  let tokenIds = fromOwner.tokenIds
  let index = tokenIds.indexOf(event.params.tokenId)
  if (index > -1) {
    tokenIds.splice(index, 1)
  }
  fromOwner.tokenIds = tokenIds

  toOwner.tokenIds = toOwner.tokenIds.concat([event.params.tokenId])

  fromOwner.save()
  toOwner.save()
}

export function handleLandMinted(event: LandMintedEvent): void {
  let entity = new LandMinted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId

  // Handle boundary points
  let boundaryPoints: string[] = []
  for (let i = 0; i < event.params.boundaryPoints.length; i++) {
    let point = new Coordinates(event.params.tokenId.toString() + "-" + i.toString())
    point.latitude = event.params.boundaryPoints[i].latitude
    point.longitude = event.params.boundaryPoints[i].longitude
    point.save()
    boundaryPoints.push(point.id)
  }
  entity.boundaryPoints = boundaryPoints

  // Handle land details
  let details = new LandDetails(event.params.tokenId.toString())
  details.size = event.params.details.size
  details.zoning = event.params.details.zoning
  details.registrationDate = event.params.details.registrationDate
  details.region = event.params.details.region
  details.city = event.params.details.city
  details.landName = event.params.details.landName
  details.value = event.params.details.value
  details.imageUrl = event.params.details.imageUrl
  details.save()
  entity.details = details.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update Owner entity
  let owner = Owner.load(event.transaction.from.toHexString())
  if (owner == null) {
    owner = new Owner(event.transaction.from.toHexString())
    owner.address = event.transaction.from
    owner.totalTokens = BigInt.fromI32(0)
    owner.totalValue = BigInt.fromI32(0)
    owner.tokenIds = []
  }
  owner.totalTokens = owner.totalTokens.plus(BigInt.fromI32(1))
  owner.totalValue = owner.totalValue.plus(event.params.details.value)
  owner.tokenIds = owner.tokenIds.concat([event.params.tokenId])
  owner.save()
}

export function handleLandValueUpdated(event: LandValueUpdatedEvent): void {
  let entity = new LandValueUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.newValue = event.params.newValue

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update LandDetails
  let details = LandDetails.load(event.params.tokenId.toString())
  if (details) {
    details.value = event.params.newValue
    details.save()
  }

  // Update Owner's total value
  let tokenIdString = event.params.tokenId.toString(); // Convert the tokenId to a string
  let byteArray = ByteArray.fromUTF8(tokenIdString);   // Convert the string to a ByteArray
  let bytes = Bytes.fromByteArray(byteArray);          // Convert the ByteArray to Bytes
  let landMinted = LandMinted.load(bytes)
  if (landMinted) {
    let owner = Owner.load(landMinted.details)
    if (owner) {
      owner.totalValue = owner.totalValue.plus(event.params.newValue)
      owner.save()
    }
  }
}

export function handleBatchMetadataUpdate(event: BatchMetadataUpdateEvent): void {
  let entity = new BatchMetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.fromTokenId = event.params._fromTokenId
  entity.toTokenId = event.params._toTokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMetadataUpdate(event: MetadataUpdateEvent): void {
  let entity = new MetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params._tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}