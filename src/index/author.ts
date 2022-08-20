import { exec } from 'shelljs';

export function getAuthorName()
{
	let author = '';

	author = exec('npm config get init-author-name', { silent: true })
		.stdout.trim();
	if (author) return author;

	author = exec('git config --global user.name', { silent: true })
		.stdout.trim();
	if (author)
	{
		setAuthorName(author);
		return author;
	}

	author = exec('npm config get init-author-email', { silent: true })
		.stdout.trim();
	if (author) return author;

	author = exec('git config --global user.email', { silent: true })
		.stdout.trim();
	if (author) return author;

	return author;
}

export function setAuthorName(author: string)
{
	exec(`npm config set init-author-name "${author}"`, { silent: true });
}
