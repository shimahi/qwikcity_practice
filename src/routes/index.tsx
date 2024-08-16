import { IconButton } from '@/components/ui/IconButton'
import { SVG } from '@/components/ui/svg'
import { authorize } from '@/domains/auth'
import { UserDomain } from '@/domains/user'
import type { User } from '@/schemas'
import type { AuthUser } from '@/services/kv'
import { css } from '@/styled-system/css'
import { container } from '@/styled-system/patterns'
import { hover } from '@/styled-system/recipes'
import { $, component$, useSignal } from '@builder.io/qwik'
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from '@builder.io/qwik-city'
import { Modal } from '@qwik-ui/headless'
import { useAuthSignin, useAuthSignout } from './plugin@auth'

export const useLoader = routeLoader$(async (requestEvent) => {
  const userDomain = new UserDomain(requestEvent)
  const users = await userDomain.paginate()
  const currentUser = await authorize(requestEvent)

  return {
    users,
    currentUser,
  }
})

export const useUpdateUser = routeAction$(
  async (data, requestEvent) => {
    const userDomain = new UserDomain(requestEvent)
    const currentUser = await authorize(requestEvent)
    const inputs = {
      ...currentUser,
      ...data.inputs,
    }
    return await userDomain.update(data.userId, inputs)
  },
  zod$({
    userId: z.string(),
    inputs: z.object({
      avatarUrl: z.string().optional(),
      displayName: z
        .string()
        .min(1, 'アカウント名を入力してください。')
        .max(50, 'アカウント名は50文字以内で入力してください。')
        .optional(),
      accountId: z
        .string()
        .min(1, 'アカウントIDを入力してください。')
        .max(20, 'アカウントIDは20文字以内で入力してください。')
        .regex(/^[a-zA-Z0-9]+$/, 'アカウントIDは半角英数字で入力してください。')
        .optional(),
      bio: z
        .string()
        .max(140, 'プロフィールは140文字以内で入力してください。')
        .optional(),
    }),
  }),
)

export default component$(() => {
  const {
    value: { users, currentUser },
  } = useLoader()

  return (
    <>
      <Header />

      <div>
        <Menu currentUser={currentUser} />
        <div
          class={[
            container(),
            css({
              width: '100%',
            }),
          ]}
        >
          <Contents users={users ?? []} />
        </div>
      </div>
    </>
  )
})

export const Header = component$(() => {
  return (
    <header
      class={css({
        display: 'flex',
        alignItems: 'center',
        px: 5,
        py: 3,
        position: 'fixed',
        width: '100%',
        height: '64px',
        bgColor: 'cyan.600',
        color: 'white',
        zIndex: 3,
        '& + *': {
          paddingTop: '64px',
        },
      })}
    >
      <div
        class={container({
          width: '100%',
        })}
      >
        <div>
          <h1
            class={css({
              textStyle: 'heading',
            })}
          >
            Qwik Summer
          </h1>
        </div>
      </div>
    </header>
  )
})

export const Contents = component$(({ users }: { users: User[] }) => {
  return (
    <div
      class={css({
        py: 8,
        md: {
          maxWidth: 'calc(100% - 300px)',
        },
      })}
    >
      <div
        class={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        })}
      >
        {users?.map((user) => {
          return (
            <div
              key={user.id}
              class={css({
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                bgColor: 'gray.100',
                maxWidth: '600px',
                px: 5,
                py: 5,
                borderRadius: '10px',
              })}
            >
              <div>
                <img
                  src={user.avatarUrl ?? 'https://picsum.photos/100/100'}
                  alt={`${user.displayName}`}
                  class={css({
                    width: '64px',
                    height: '64px',
                    borderRadius: '100%',
                    objectFit: 'cover',
                    mx: 'auto',
                  })}
                />
                <div
                  class={css({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    gap: 1,
                    width: '100%',
                    mt: 2,
                  })}
                >
                  <div class={css({ textStyle: 'subtitle1' })}>
                    {user.displayName}
                  </div>
                  <small
                    class={css({
                      textStyle: 'caption',
                      color: 'gray.500',
                    })}
                  >
                    @{user.accountId}
                  </small>
                </div>
                <div
                  class={css({
                    mt: 2,
                  })}
                >
                  <p
                    class={css({
                      textStyle: 'body',
                    })}
                  >
                    {user.bio}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export const Menu = component$(
  ({ currentUser }: { currentUser: AuthUser | null }) => {
    return (
      <>
        <Modal.Root
          class={[
            'Modal-wrapper',
            css({
              display: 'block',
              md: {
                display: 'none',
              },
            }),
          ]}
        >
          <Modal.Trigger
            class={[
              'Modal-trigger',
              css({
                position: 'fixed',
                top: 5,
                right: 5,
                zIndex: 3,
              }),
            ]}
          >
            <SVG.Menu color="white" class="menu-button" />
          </Modal.Trigger>
          <Modal.Panel>
            <div
              class={css({
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100%',
                width: '100%',
                backgroundColor: 'gray.100',
              })}
            >
              <Modal.Close
                class={[
                  'modal-Close',
                  css({
                    position: 'fixed',
                    top: 5,
                    right: 5,
                    zIndex: 3,
                  }),
                ]}
              >
                <SVG.Close />
              </Modal.Close>
              <MenuContent currentUser={currentUser} />
            </div>
          </Modal.Panel>
        </Modal.Root>
        <div
          class={css({
            paddingTop: '64px',
            backgroundColor: 'gray.100',
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            zIndex: 2,
            width: '300px',
            display: 'none',
            md: {
              display: 'block',
            },
          })}
        >
          <MenuContent currentUser={currentUser} />
        </div>
      </>
    )
  },
)

export const MenuContent = component$(
  ({ currentUser }: { currentUser: AuthUser | null }) => {
    const signIn = useAuthSignin()
    const signOut = useAuthSignout()

    const handleSignIn = $(() => {
      signIn
        .submit({
          providerId: 'google',
        })
        .catch((e) => {
          console.log({ e })
        })
    })

    const handleSignOut = $(() => {
      signOut.submit({
        callbackUrl: '/?logout=true',
      })
    })

    return currentUser ? (
      <>
        <div
          class={css({
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <div
            class={css({
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              width: '100%',
            })}
          >
            <div
              class={css({
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                justifyContent: 'center',
                alignItems: 'center',
                height: 16,
                px: 5,
                width: '100%',
              })}
            >
              <ImageUploader
                userId={currentUser.id}
                avatarUrl={
                  currentUser.avatarUrl ?? 'https://picsum.photos/100/100'
                }
              />
              <div
                class={css({
                  display: 'flex',
                  flexDirection: 'column',
                  pl: 8,
                  gap: 2,
                })}
              >
                <DisplayNameForm
                  displayName={currentUser.displayName}
                  userId={currentUser.id}
                />
                <AccountIdForm
                  accountId={currentUser.accountId}
                  userId={currentUser.id}
                />
              </div>
              <BioForm bio={currentUser.bio ?? ''} userId={currentUser.id} />
            </div>
          </div>

          <div
            class={css({
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              alignItems: 'center',
              height: 16,
            })}
          >
            <button
              onClick$={handleSignOut}
              class={[
                css({
                  textStyle: 'button',
                }),
                hover(),
              ]}
            >
              ログアウト
            </button>
            <button
              onClick$={() => {}}
              class={[
                css({
                  textStyle: 'button',
                  color: 'red.600',
                }),
                hover(),
              ]}
            >
              アカウント削除
            </button>
          </div>
        </div>
      </>
    ) : (
      <div
        class={css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          pb: '64px',
        })}
      >
        <button
          onClick$={handleSignIn}
          class={[
            css({
              padding: '10px 20px',
              bgColor: 'black',
              color: 'white',
              borderRadius: '5px',
              fontWeight: 'bold',
              textStyle: 'button',
            }),
            hover(),
          ]}
        >
          ログイン
        </button>
      </div>
    )
  },
)

export const ImageUploader = component$(
  ({ avatarUrl }: { avatarUrl: string; userId: string }) => {
    const ref = useSignal<HTMLInputElement>()
    const tmpAvatarUrl = useSignal<string>(avatarUrl)

    const handleImageClick = $(() => {
      ref.value?.click()
    })

    const handleFileChange = $(async (event: Event) => {})

    return (
      <div>
        <button onClick$={handleImageClick} class={hover()} disabled={false}>
          <div
            class={css({
              width: 'auto',
              height: '64px',
              mx: 'auto',
              objectFit: 'cover',
              aspectRatio: 1,
              position: 'relative',
            })}
          >
            <img
              src={tmpAvatarUrl.value}
              alt=""
              class={css({
                zIndex: 0,
                objectFit: 'cover',
                borderRadius: '100%',
                width: '100%',
                height: '100%',
              })}
            />
          </div>
        </button>

        <input
          ref={ref}
          type="file"
          accept=".jpeg,.jpg,.png,.webp"
          onChange$={handleFileChange}
          class={css({ display: 'none' })}
        />
      </div>
    )
  },
)

export const DisplayNameForm = component$(
  ({ displayName }: { displayName: string; userId: string }) => {
    const editingDisplayName = useSignal(false)
    const displayNameInput = useSignal(displayName)

    const inputRef = useSignal<HTMLInputElement>()

    const handleKeyDown = $((event: KeyboardEvent) => {})

    return (
      <div class={css({ pl: 10 })}>
        <div
          class={css({
            display: 'flex',
            alignItems: 'baseline',
            width: '200px',
          })}
        >
          {/* 名前を表示するところ */}
          <div class={css({ width: '136px' })}>
            {editingDisplayName.value ? (
              <div class={css({ width: '100%', position: 'relative' })}>
                <input
                  ref={inputRef}
                  autofocus
                  type="text"
                  value={displayNameInput.value}
                  onInput$={(e) => {
                    displayNameInput.value = (
                      e.target as HTMLInputElement
                    ).value
                  }}
                  onKeyDown$={handleKeyDown}
                  class={css({
                    width: '100%',
                    textAlign: 'center',
                    textStyle: 'subtitle1',
                  })}
                />
                <div
                  class={css({
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    borderBottom: '1px solid gray',
                  })}
                />
              </div>
            ) : (
              <div class={css({ width: '100%' })}>
                <h3
                  class={css({
                    width: '100%',
                    textAlign: 'center',
                    textStyle: 'subtitle1',
                  })}
                >
                  {displayName}
                </h3>
              </div>
            )}
          </div>
          {/* ボタンを表示するところ */}
          <div
            class={css({
              minWidth: '64px',
              flex: 1,
            })}
          >
            {editingDisplayName.value ? (
              <div
                class={css({
                  display: 'flex',
                  gap: 2,
                })}
              >
                <IconButton
                  icon="Close"
                  color="red"
                  onClick$={() => {
                    displayNameInput.value = displayName
                    editingDisplayName.value = false
                  }}
                />
                <IconButton
                  icon="Check"
                  color="teal"
                  onClick$={async () => {}}
                />
              </div>
            ) : (
              <div>
                <IconButton
                  icon="Pencil"
                  onClick$={() => {
                    editingDisplayName.value = true
                    // オートフォーカス処理
                    const timeOutId = setTimeout(() => {
                      inputRef.value?.focus()
                      clearTimeout(timeOutId)
                    }, 50)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

export const AccountIdForm = component$(
  ({ accountId }: { accountId: string; userId: string }) => {
    const editingAccountId = useSignal(false)
    const accountIdInput = useSignal(accountId)
    const inputRef = useSignal<HTMLInputElement>()

    const handleKeyDown = $((event: KeyboardEvent) => {})

    return (
      <div class={css({ pl: 10 })}>
        <div
          class={css({
            display: 'flex',
            alignItems: 'baseline',
            width: '200px',
          })}
        >
          {/* アカウントIDを表示するところ */}
          <div class={css({ width: '136px' })}>
            {editingAccountId.value ? (
              <div class={css({ width: '100%', position: 'relative' })}>
                <input
                  type="text"
                  autofocus
                  ref={inputRef}
                  onKeyDown$={handleKeyDown}
                  value={accountIdInput.value}
                  onInput$={(e) => {
                    accountIdInput.value = (e.target as HTMLInputElement).value
                  }}
                  class={css({
                    width: '100%',
                    textAlign: 'center',
                    textStyle: 'input',
                    color: 'gray.500',
                  })}
                />
                <div
                  class={css({
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    borderBottom: '1px solid gray',
                  })}
                />
              </div>
            ) : (
              <div class={css({ width: '100%' })}>
                <h4
                  class={css({
                    width: '100%',
                    textAlign: 'center',
                    textStyle: 'caption',
                    color: 'gray.500',
                  })}
                >
                  @{accountId}
                </h4>
              </div>
            )}
          </div>
          {/* ボタンを表示するところ */}
          <div
            class={css({
              minWidth: '64px',
              flex: 1,
            })}
          >
            {editingAccountId.value ? (
              <div
                class={css({
                  display: 'flex',
                  gap: 2,
                })}
              >
                <IconButton
                  icon="Close"
                  color="red"
                  onClick$={() => {
                    accountIdInput.value = accountId
                    editingAccountId.value = false
                  }}
                />
                <IconButton
                  icon="Check"
                  color="teal"
                  onClick$={async () => {}}
                />
              </div>
            ) : (
              <div>
                <IconButton
                  icon="Pencil"
                  onClick$={() => {
                    editingAccountId.value = true
                    // オートフォーカス処理
                    const timeOutId = setTimeout(() => {
                      inputRef.value?.focus()
                      clearTimeout(timeOutId)
                    }, 50)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

export const BioForm = component$(
  ({ bio }: { bio: string; userId: string }) => {
    const editingBio = useSignal(false)
    const bioInput = useSignal(bio)
    const ref = useSignal<HTMLTextAreaElement>()

    const handleKeyDown = $((event: KeyboardEvent) => {})

    return (
      <div class={css({ width: '100%' })}>
        <textarea
          ref={ref}
          rows={5}
          onKeyDown$={handleKeyDown}
          value={bioInput.value}
          placeholder="プロフィールを入力してください"
          onFocusIn$={() => {
            editingBio.value = true
          }}
          onInput$={(e) => {
            bioInput.value = (e.target as HTMLInputElement).value
          }}
          class={css({
            textStyle: 'input',
            p: 2,
            transition: 'background-color 0.3s ',
            minWidth: '200px',
            width: '100%',
            '&:hover:not(:focus)': {
              bgColor: 'gray.200',
            },
          })}
        />
        {editingBio.value && (
          <div
            class={css({ display: 'flex', gap: 2, justifyContent: 'flex-end' })}
          >
            <IconButton
              icon="Close"
              color="red"
              onClick$={() => {
                editingBio.value = false
                bioInput.value = bio
              }}
            />
            <IconButton icon="Check" color="teal" onClick$={async () => {}} />
          </div>
        )}
      </div>
    )
  },
)

export const head: DocumentHead = {
  title: 'Qwik Summer',
  meta: [
    {
      name: 'description',
      content: 'Sample App for Qwik City',
    },
  ],
}
