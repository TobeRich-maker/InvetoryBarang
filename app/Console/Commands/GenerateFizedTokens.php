<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateFixedTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate fixed token prefixes for all users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        $count = 0;

        foreach ($users as $user) {
            if (empty($user->token_prefix)) {
                $user->token_prefix = Str::random(20);
                $user->token_series = 1;
                $user->save();
                $count++;
            }
        }

        $this->info("Generated token prefixes for {$count} users.");
        return Command::SUCCESS;
    }
}
