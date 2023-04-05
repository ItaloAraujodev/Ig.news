import Head from 'next/head';
import Image from 'next/image';
import styles from './home.module.scss';
import { SubscribeButton } from '@/components/SubscribeButton';

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Ig News</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, wlcome</span>
          <h1>News abount the <span>React </span>world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for $9.90 month</span>
          </p>
          <SubscribeButton />
        </section>

        <Image
          src="/images/avatar.svg"
          alt='Girl coding'
          width={500}
          height={500}
        />
      </main>
    </>
  )
}
