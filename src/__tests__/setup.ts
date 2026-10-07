import { afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// Tear down every mounted component after each test. Otherwise earlier tests' apps stay
// alive in the same file, and their watchers keep reacting to later tests' route changes.
enableAutoUnmount(afterEach)
