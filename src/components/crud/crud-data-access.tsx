'use client'

import { getCrudProgram, getCrudProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

interface CreateJournalArgs {
  owner: PublicKey;
  title: string;
  message: string;
}

export function useCrudProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCrudProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['crud', 'all', { cluster }],
    queryFn: () => program.account.journal.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createJournal = useMutation<string, Error, CreateJournalArgs>({
    mutationKey: ['journal', 'create', { cluster }],
    mutationFn: async ({ title, message: description }) => {
      console.log('getting title ', title);
      return program.methods.createJournal(title, description).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize create journal account tx'),
  })


  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createJournal,
  }
}

export function useCrudProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudProgram()

  const accountQuery = useQuery({
    queryKey: ['crud', 'fetch', { cluster, account }],
    queryFn: () => program.account.journal.fetch(account),
  })

  const updateJournal = useMutation<string, Error, CreateJournalArgs>({
    mutationKey: ['journal', 'update', { cluster }],
    mutationFn: async ({ title, message: description }) => {
      return program.methods.updateJournal(title, description).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize update journal account tx'),
  })

  const deleteJournal = useMutation({
    mutationKey: ['journal', 'delete', { cluster }],
    mutationFn: async (title: string) => {
      console.log('getting title ', title);
      
      return program.methods.deleteJournal(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize delete journal account tx'),
  })

  return {
    accountQuery,
    deleteJournal,
    updateJournal,
  }
}
