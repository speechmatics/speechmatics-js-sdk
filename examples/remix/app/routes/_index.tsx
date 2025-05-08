import { redirect, type MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Speechmatics Remix Example' },
    {
      name: 'description',
      content: 'Remix example showcasing the Speechmatics JS SDK',
    },
  ];
};

export async function loader() {
  return redirect('/flow');
}
