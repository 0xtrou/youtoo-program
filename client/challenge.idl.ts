import type { Program } from '@project-serum/anchor';
export type Challenge = {
  version: '0.1.0';
  name: 'challenge';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challengeRegistry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'InitializeChallengePlatformParams';
          };
        },
      ];
    },
    {
      name: 'updateChallengeRegistry';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challengeRegistry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'UpdateChallengePlatformParams';
          };
        },
      ];
    },
    {
      name: 'createTokenVault';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challengeRegistry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'challengeTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createChallenge';
      accounts: [
        {
          name: 'challengeOwner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challenge';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'challengeRegistry';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'CreateChallengeParams';
          };
        },
      ];
    },
    {
      name: 'cancelChallenge';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challenge';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'CancelChallengeParams';
          };
        },
      ];
    },
    {
      name: 'transferAssetsToVault';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mintAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'signerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'challenge';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'challengeTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'TransferAssetsToVaultParams';
          };
        },
      ];
    },
    {
      name: 'transferAssetsFromVault';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mintAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'challengeRegistry';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'signerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'challenge';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'challengeTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'TransferAssetsFromVaultParams';
          };
        },
      ];
    },
    {
      name: 'submitWinnerList';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'challengeRegistry';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'challenge';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SubmitWinnersParams';
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'challengePlatformRegistry';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'wasInitialized';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'allowedAdministrators';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'allowedMintAccounts';
            type: {
              vec: {
                defined: 'MintInfo';
              };
            };
          },
        ];
      };
    },
    {
      name: 'challenge';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'id';
            type: 'string';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'minDeposit';
            type: 'u64';
          },
          {
            name: 'players';
            type: {
              vec: {
                defined: 'PlayerInfo';
              };
            };
          },
          {
            name: 'prizePool';
            type: 'u64';
          },
          {
            name: 'donatePool';
            type: 'u64';
          },
          {
            name: 'rewardTokenMintAccount';
            type: 'publicKey';
          },
          {
            name: 'status';
            type: {
              defined: 'ChallengeStatus';
            };
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'CancelChallengeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'id';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'CreateChallengeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'id';
            type: 'string';
          },
          {
            name: 'minDeposit';
            type: 'u64';
          },
          {
            name: 'rewardTokenMintAccount';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'InitializeChallengePlatformParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowedMintAccounts';
            type: {
              vec: {
                defined: 'MintInfo';
              };
            };
          },
          {
            name: 'allowedAdministrators';
            type: {
              vec: 'publicKey';
            };
          },
        ];
      };
    },
    {
      name: 'SubmitWinnersParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'id';
            type: 'string';
          },
          {
            name: 'winnerList';
            type: {
              vec: 'publicKey';
            };
          },
        ];
      };
    },
    {
      name: 'TransferAssetsFromVaultParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'challengeTokenVaultBump';
            type: 'u8';
          },
          {
            name: 'challengeId';
            type: 'string';
          },
          {
            name: 'actionType';
            type: {
              defined: 'TransferAssetsFromVaultActionType';
            };
          },
        ];
      };
    },
    {
      name: 'TransferAssetsToVaultParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'challengeTokenVaultBump';
            type: 'u8';
          },
          {
            name: 'challengeId';
            type: 'string';
          },
          {
            name: 'actionType';
            type: {
              defined: 'TransferAssetsToVaultActionType';
            };
          },
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'UpdateChallengePlatformParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowedMintAccounts';
            type: {
              vec: {
                defined: 'MintInfo';
              };
            };
          },
          {
            name: 'allowedAdministrators';
            type: {
              vec: 'publicKey';
            };
          },
        ];
      };
    },
    {
      name: 'MintInfo';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isEnabled';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'mintAccount';
            type: 'publicKey';
          },
          {
            name: 'tokenAccount';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'PlayerInfo';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'publicKey';
            type: 'publicKey';
          },
          {
            name: 'totalDeposit';
            type: 'u64';
          },
          {
            name: 'isWinner';
            type: 'bool';
          },
          {
            name: 'isWinnerClaimedReward';
            type: 'bool';
          },
          {
            name: 'isPlayerWithdrawn';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'TransferAssetsFromVaultActionType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Claiming';
          },
          {
            name: 'Withdrawing';
          },
          {
            name: 'AdminWithdrawingDonatePool';
          },
        ];
      };
    },
    {
      name: 'TransferAssetsToVaultActionType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'JoinChallenge';
          },
          {
            name: 'Donate';
          },
        ];
      };
    },
    {
      name: 'ChallengeStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Created';
          },
          {
            name: 'Finalized';
          },
          {
            name: 'Canceled';
          },
          {
            name: 'Claimed';
          },
          {
            name: 'Withdrawn';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'ChallengeRegistryUpdated';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'allowedAdministrators';
          type: {
            vec: 'publicKey';
          };
          index: false;
        },
        {
          name: 'allowedMintAccounts';
          type: {
            vec: {
              defined: 'MintInfo';
            };
          };
          index: false;
        },
      ];
    },
    {
      name: 'VaultCreated';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'authority';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'mintAccount';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'associatedAccount';
          type: 'publicKey';
          index: true;
        },
      ];
    },
    {
      name: 'ChallengeCreated';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeKey';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'id';
          type: 'string';
          index: true;
        },
      ];
    },
    {
      name: 'ChallengeFinalized';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeKey';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'id';
          type: 'string';
          index: true;
        },
        {
          name: 'status';
          type: {
            defined: 'ChallengeStatus';
          };
          index: false;
        },
      ];
    },
    {
      name: 'ChallengeCanceled';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeKey';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'id';
          type: 'string';
          index: true;
        },
        {
          name: 'status';
          type: {
            defined: 'ChallengeStatus';
          };
          index: false;
        },
      ];
    },
    {
      name: 'RewardReceived';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeKey';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeId';
          type: 'string';
          index: true;
        },
        {
          name: 'rewardMintToken';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'actionType';
          type: {
            defined: 'TransferAssetsToVaultActionType';
          };
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'RewardClaimed';
      fields: [
        {
          name: 'actor';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeKey';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'challengeId';
          type: 'string';
          index: true;
        },
        {
          name: 'rewardMintToken';
          type: 'publicKey';
          index: true;
        },
        {
          name: 'actionType';
          type: {
            defined: 'TransferAssetsFromVaultActionType';
          };
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'AlreadyInitialized';
      msg: 'The program was already initialized';
    },
    {
      code: 6001;
      name: 'MintAccountExisted';
      msg: 'The mint account was existed';
    },
    {
      code: 6002;
      name: 'OnlyAdministrator';
      msg: 'Only Platform Admin';
    },
    {
      code: 6003;
      name: 'OnlyOwner';
      msg: 'Only Owner';
    },
    {
      code: 6004;
      name: 'OrderExpired';
      msg: 'Order expired';
    },
    {
      code: 6005;
      name: 'InvalidOffer';
      msg: 'Invalid Offer';
    },
    {
      code: 6006;
      name: 'InvalidValue';
      msg: 'Invalid value';
    },
    {
      code: 6007;
      name: 'UnAllowedMintToken';
      msg: 'Invalid value';
    },
    {
      code: 6008;
      name: 'ChallengeCannotBeCanceled';
      msg: 'Challenge cannot be canceled';
    },
    {
      code: 6009;
      name: 'WithdrawalIsNotAvailable';
      msg: 'Withdrawal is not available for the challenge';
    },
    {
      code: 6010;
      name: 'ClaimIsNotAvailable';
      msg: 'Claim is not available for the challenge';
    },
    {
      code: 6011;
      name: 'TransferTokenFromVaultIsNotAvailable';
      msg: 'Transfer token from vault is not available for the challenge';
    },
    {
      code: 6012;
      name: 'DepositIsNotAvailable';
      msg: 'Deposit is not available for the challenge';
    },
    {
      code: 6013;
      name: 'OnlyParticipant';
      msg: 'Only participants can execute this operation';
    },
    {
      code: 6014;
      name: 'AlreadyParticipated';
      msg: 'The participant already participated in the challenge.';
    },
    {
      code: 6015;
      name: 'MinDepositIsNotReached';
      msg: 'Min deposit amount is not reached';
    },
  ];
};

export const IDL: Challenge = {
  version: '0.1.0',
  name: 'challenge',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challengeRegistry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'InitializeChallengePlatformParams',
          },
        },
      ],
    },
    {
      name: 'updateChallengeRegistry',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challengeRegistry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'UpdateChallengePlatformParams',
          },
        },
      ],
    },
    {
      name: 'createTokenVault',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challengeRegistry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'challengeTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createChallenge',
      accounts: [
        {
          name: 'challengeOwner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challenge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'challengeRegistry',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'CreateChallengeParams',
          },
        },
      ],
    },
    {
      name: 'cancelChallenge',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challenge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'CancelChallengeParams',
          },
        },
      ],
    },
    {
      name: 'transferAssetsToVault',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mintAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'signerTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'challenge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'challengeTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'TransferAssetsToVaultParams',
          },
        },
      ],
    },
    {
      name: 'transferAssetsFromVault',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mintAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'challengeRegistry',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'signerTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'challenge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'challengeTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'TransferAssetsFromVaultParams',
          },
        },
      ],
    },
    {
      name: 'submitWinnerList',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'challengeRegistry',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'challenge',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SubmitWinnersParams',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'challengePlatformRegistry',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'wasInitialized',
            type: 'bool',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'allowedAdministrators',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'allowedMintAccounts',
            type: {
              vec: {
                defined: 'MintInfo',
              },
            },
          },
        ],
      },
    },
    {
      name: 'challenge',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'minDeposit',
            type: 'u64',
          },
          {
            name: 'players',
            type: {
              vec: {
                defined: 'PlayerInfo',
              },
            },
          },
          {
            name: 'prizePool',
            type: 'u64',
          },
          {
            name: 'donatePool',
            type: 'u64',
          },
          {
            name: 'rewardTokenMintAccount',
            type: 'publicKey',
          },
          {
            name: 'status',
            type: {
              defined: 'ChallengeStatus',
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'CancelChallengeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'id',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'CreateChallengeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'minDeposit',
            type: 'u64',
          },
          {
            name: 'rewardTokenMintAccount',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'InitializeChallengePlatformParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'allowedMintAccounts',
            type: {
              vec: {
                defined: 'MintInfo',
              },
            },
          },
          {
            name: 'allowedAdministrators',
            type: {
              vec: 'publicKey',
            },
          },
        ],
      },
    },
    {
      name: 'SubmitWinnersParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'winnerList',
            type: {
              vec: 'publicKey',
            },
          },
        ],
      },
    },
    {
      name: 'TransferAssetsFromVaultParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'challengeTokenVaultBump',
            type: 'u8',
          },
          {
            name: 'challengeId',
            type: 'string',
          },
          {
            name: 'actionType',
            type: {
              defined: 'TransferAssetsFromVaultActionType',
            },
          },
        ],
      },
    },
    {
      name: 'TransferAssetsToVaultParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'challengeTokenVaultBump',
            type: 'u8',
          },
          {
            name: 'challengeId',
            type: 'string',
          },
          {
            name: 'actionType',
            type: {
              defined: 'TransferAssetsToVaultActionType',
            },
          },
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'UpdateChallengePlatformParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'allowedMintAccounts',
            type: {
              vec: {
                defined: 'MintInfo',
              },
            },
          },
          {
            name: 'allowedAdministrators',
            type: {
              vec: 'publicKey',
            },
          },
        ],
      },
    },
    {
      name: 'MintInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isEnabled',
            type: 'bool',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'mintAccount',
            type: 'publicKey',
          },
          {
            name: 'tokenAccount',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'PlayerInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'publicKey',
            type: 'publicKey',
          },
          {
            name: 'totalDeposit',
            type: 'u64',
          },
          {
            name: 'isWinner',
            type: 'bool',
          },
          {
            name: 'isWinnerClaimedReward',
            type: 'bool',
          },
          {
            name: 'isPlayerWithdrawn',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'TransferAssetsFromVaultActionType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Claiming',
          },
          {
            name: 'Withdrawing',
          },
          {
            name: 'AdminWithdrawingDonatePool',
          },
        ],
      },
    },
    {
      name: 'TransferAssetsToVaultActionType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'JoinChallenge',
          },
          {
            name: 'Donate',
          },
        ],
      },
    },
    {
      name: 'ChallengeStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Created',
          },
          {
            name: 'Finalized',
          },
          {
            name: 'Canceled',
          },
          {
            name: 'Claimed',
          },
          {
            name: 'Withdrawn',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'ChallengeRegistryUpdated',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'allowedAdministrators',
          type: {
            vec: 'publicKey',
          },
          index: false,
        },
        {
          name: 'allowedMintAccounts',
          type: {
            vec: {
              defined: 'MintInfo',
            },
          },
          index: false,
        },
      ],
    },
    {
      name: 'VaultCreated',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'authority',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'mintAccount',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'associatedAccount',
          type: 'publicKey',
          index: true,
        },
      ],
    },
    {
      name: 'ChallengeCreated',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeKey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'id',
          type: 'string',
          index: true,
        },
      ],
    },
    {
      name: 'ChallengeFinalized',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeKey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'id',
          type: 'string',
          index: true,
        },
        {
          name: 'status',
          type: {
            defined: 'ChallengeStatus',
          },
          index: false,
        },
      ],
    },
    {
      name: 'ChallengeCanceled',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeKey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'id',
          type: 'string',
          index: true,
        },
        {
          name: 'status',
          type: {
            defined: 'ChallengeStatus',
          },
          index: false,
        },
      ],
    },
    {
      name: 'RewardReceived',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeKey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeId',
          type: 'string',
          index: true,
        },
        {
          name: 'rewardMintToken',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'actionType',
          type: {
            defined: 'TransferAssetsToVaultActionType',
          },
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'RewardClaimed',
      fields: [
        {
          name: 'actor',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeKey',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'challengeId',
          type: 'string',
          index: true,
        },
        {
          name: 'rewardMintToken',
          type: 'publicKey',
          index: true,
        },
        {
          name: 'actionType',
          type: {
            defined: 'TransferAssetsFromVaultActionType',
          },
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'AlreadyInitialized',
      msg: 'The program was already initialized',
    },
    {
      code: 6001,
      name: 'MintAccountExisted',
      msg: 'The mint account was existed',
    },
    {
      code: 6002,
      name: 'OnlyAdministrator',
      msg: 'Only Platform Admin',
    },
    {
      code: 6003,
      name: 'OnlyOwner',
      msg: 'Only Owner',
    },
    {
      code: 6004,
      name: 'OrderExpired',
      msg: 'Order expired',
    },
    {
      code: 6005,
      name: 'InvalidOffer',
      msg: 'Invalid Offer',
    },
    {
      code: 6006,
      name: 'InvalidValue',
      msg: 'Invalid value',
    },
    {
      code: 6007,
      name: 'UnAllowedMintToken',
      msg: 'Invalid value',
    },
    {
      code: 6008,
      name: 'ChallengeCannotBeCanceled',
      msg: 'Challenge cannot be canceled',
    },
    {
      code: 6009,
      name: 'WithdrawalIsNotAvailable',
      msg: 'Withdrawal is not available for the challenge',
    },
    {
      code: 6010,
      name: 'ClaimIsNotAvailable',
      msg: 'Claim is not available for the challenge',
    },
    {
      code: 6011,
      name: 'TransferTokenFromVaultIsNotAvailable',
      msg: 'Transfer token from vault is not available for the challenge',
    },
    {
      code: 6012,
      name: 'DepositIsNotAvailable',
      msg: 'Deposit is not available for the challenge',
    },
    {
      code: 6013,
      name: 'OnlyParticipant',
      msg: 'Only participants can execute this operation',
    },
    {
      code: 6014,
      name: 'AlreadyParticipated',
      msg: 'The participant already participated in the challenge.',
    },
    {
      code: 6015,
      name: 'MinDepositIsNotReached',
      msg: 'Min deposit amount is not reached',
    },
  ],
};

export type MintInfo = Awaited<
  ReturnType<
    Program<Challenge>['account']['challengePlatformRegistry']['fetch']
  >
>;

export type ChallengePlatformRegistryState = Awaited<
  ReturnType<
    Program<Challenge>['account']['challengePlatformRegistry']['fetch']
  >
>;

export type ChallengeState = Awaited<
  ReturnType<Program<Challenge>['account']['challenge']['fetch']>
>;
